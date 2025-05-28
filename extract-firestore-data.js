#!/usr/bin/env node

/**
 * Firebase Firestore Data Extractor
 * 
 * This script connects to your specific Firestore database and extracts all data.
 * 
 * Setup:
 * 1. npm install firebase-admin
 * 2. Download service account key from Firebase Console:
 *    - Go to Project Settings → Service Accounts
 *    - Click "Generate New Private Key"
 *    - Save as 'serviceAccountKey.json' in this directory
 * 3. Run: node extract-firestore-data.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    serviceAccountPath: './serviceAccountKey.json',
    databaseId: 'chatgpt-extractor-database', // Your specific database
    collections: ['extractions', 'feedback', 'users'], // Collections to extract
    outputFile: 'firestore-data-export.json'
};

class FirestoreExtractor {
    constructor() {
        this.app = null;
        this.db = null;
        this.stats = {
            totalCollections: 0,
            totalDocuments: 0,
            startTime: Date.now()
        };
    }

    async initialize() {
        try {
            console.log('🔥 Firebase Firestore Data Extractor');
            console.log('=====================================\n');

            // Check if service account file exists
            if (!fs.existsSync(CONFIG.serviceAccountPath)) {
                throw new Error(`Service account file not found: ${CONFIG.serviceAccountPath}\n\nTo get your service account key:\n1. Go to Firebase Console → Project Settings → Service Accounts\n2. Click "Generate New Private Key"\n3. Save as 'serviceAccountKey.json' in this directory`);
            }

            // Load service account
            const serviceAccount = require(path.resolve(CONFIG.serviceAccountPath));
            console.log(`📁 Service account loaded: ${serviceAccount.project_id}`);

            // Initialize Firebase Admin
            this.app = initializeApp({
                credential: cert(serviceAccount)
            });

            // Connect to specific database
            this.db = getFirestore(this.app, CONFIG.databaseId);
            console.log(`🗄️  Connected to database: ${CONFIG.databaseId}`);
            
            return true;
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            return false;
        }
    }

    async extractCollection(collectionName) {
        try {
            console.log(`📥 Extracting collection: ${collectionName}`);
            
            const collectionRef = this.db.collection(collectionName);
            const snapshot = await collectionRef.get();
            
            if (snapshot.empty) {
                console.log(`   ⚠️  Collection '${collectionName}' is empty`);
                return [];
            }

            const documents = [];
            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });

            console.log(`   ✅ Extracted ${documents.length} documents`);
            
            // Show sample document structure
            if (documents.length > 0) {
                const sampleFields = Object.keys(documents[0].data).slice(0, 5);
                console.log(`   📋 Sample fields: ${sampleFields.join(', ')}`);
            }

            this.stats.totalDocuments += documents.length;
            return documents;

        } catch (error) {
            console.error(`   ❌ Error extracting '${collectionName}':`, error.message);
            return { error: error.message };
        }
    }

    async extractAllData() {
        const extractedData = {
            extractionInfo: {
                timestamp: new Date().toISOString(),
                databaseId: CONFIG.databaseId,
                extractor: 'Firebase Admin SDK Node.js'
            },
            collections: {}
        };

        console.log(`\n🚀 Starting extraction of ${CONFIG.collections.length} collections...\n`);

        for (const collectionName of CONFIG.collections) {
            extractedData.collections[collectionName] = await this.extractCollection(collectionName);
            this.stats.totalCollections++;
        }

        return extractedData;
    }

    async saveData(data) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `firestore-extract-${timestamp}.json`;
            
            // Save main data file
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`\n💾 Data saved to: ${filename}`);

            // Create summary file
            const summary = {
                extractionTime: data.extractionInfo.timestamp,
                databaseId: CONFIG.databaseId,
                totalCollections: this.stats.totalCollections,
                totalDocuments: this.stats.totalDocuments,
                processingTime: `${((Date.now() - this.stats.startTime) / 1000).toFixed(2)}s`,
                collectionsOverview: {}
            };

            // Add collection summaries
            Object.keys(data.collections).forEach(collectionName => {
                const collectionData = data.collections[collectionName];
                if (Array.isArray(collectionData)) {
                    summary.collectionsOverview[collectionName] = {
                        documentCount: collectionData.length,
                        sampleDocument: collectionData.length > 0 ? collectionData[0] : null
                    };
                } else {
                    summary.collectionsOverview[collectionName] = {
                        documentCount: 0,
                        error: collectionData.error
                    };
                }
            });

            const summaryFilename = `firestore-summary-${timestamp}.json`;
            fs.writeFileSync(summaryFilename, JSON.stringify(summary, null, 2));
            console.log(`📊 Summary saved to: ${summaryFilename}`);

            return { dataFile: filename, summaryFile: summaryFilename };

        } catch (error) {
            console.error('❌ Error saving data:', error.message);
            throw error;
        }
    }

    printStats() {
        console.log('\n🎉 Extraction Complete!');
        console.log('======================');
        console.log(`📊 Total Collections: ${this.stats.totalCollections}`);
        console.log(`📄 Total Documents: ${this.stats.totalDocuments}`);
        console.log(`⏱️  Processing Time: ${((Date.now() - this.stats.startTime) / 1000).toFixed(2)}s`);
        console.log(`🗄️  Database: ${CONFIG.databaseId}`);
    }

    async cleanup() {
        if (this.app) {
            await this.app.delete();
            console.log('\n🧹 Cleanup completed');
        }
    }
}

// Auto-discovery of collections
async function discoverCollections(db) {
    try {
        console.log('🔍 Attempting to discover collections...');
        
        // Try the known collections first, then common ones
        const commonCollections = [
            'extractions', 'feedback', 'users', // Known from Firebase Console
            'messages', 'conversations', 'chats', 'prompts', 'sessions', 
            'analytics', 'logs', 'history'
        ];
        
        const existingCollections = [];
        
        for (const collectionName of commonCollections) {
            try {
                const snapshot = await db.collection(collectionName).limit(1).get();
                if (!snapshot.empty) {
                    existingCollections.push(collectionName);
                }
            } catch (error) {
                // Silently ignore - collection doesn't exist or no permission
            }
        }
        
        if (existingCollections.length > 0) {
            console.log(`✅ Found collections: ${existingCollections.join(', ')}`);
            return existingCollections;
        } else {
            console.log('⚠️  No common collections found. Using configured list.');
            return CONFIG.collections;
        }
    } catch (error) {
        console.log('⚠️  Collection discovery failed. Using configured list.');
        return CONFIG.collections;
    }
}

// Main execution
async function main() {
    const extractor = new FirestoreExtractor();
    
    try {
        // Initialize connection
        if (!await extractor.initialize()) {
            process.exit(1);
        }

        // Discover collections
        const collections = await discoverCollections(extractor.db);
        CONFIG.collections = collections;

        // Extract all data
        const data = await extractor.extractAllData();

        // Save to files
        const files = await extractor.saveData(data);

        // Print statistics
        extractor.printStats();

        console.log(`\n📁 Files created:`);
        console.log(`   ${files.dataFile}`);
        console.log(`   ${files.summaryFile}`);

    } catch (error) {
        console.error('\n💥 Fatal error:', error.message);
        process.exit(1);
    } finally {
        await extractor.cleanup();
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { FirestoreExtractor, CONFIG };