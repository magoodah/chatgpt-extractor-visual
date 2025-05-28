#!/usr/bin/env node

// Firebase Data Extractor Script
// This script connects to Firebase Realtime Database and exports all data to a local file

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTnJYiMDXpw66ztcsADQ78lTllI5IkpdU",
    authDomain: "chatgpt-extractor.firebaseapp.com",
    projectId: "chatgpt-extractor",
    storageBucket: "chatgpt-extractor.firebasestorage.app",
    messagingSenderId: "229470439255",
    appId: "1:229470439255:web:12200598158425efcce012",
    measurementId: "G-XQEBYCEM11",
    databaseURL: "https://chatgpt-extractor-database-default-rtdb.firebaseio.com/"
};

async function extractFirebaseData() {
    try {
        console.log('🔥 Initializing Firebase Admin SDK...');
        
        // Initialize Firebase Admin SDK
        admin.initializeApp({
            databaseURL: firebaseConfig.databaseURL,
            projectId: firebaseConfig.projectId
        });

        const database = admin.database();
        
        console.log('📊 Connecting to Firebase database...');
        console.log('Database URL:', firebaseConfig.databaseURL);
        
        // Get reference to the root of the database
        const rootRef = database.ref('/');
        
        console.log('⬇️  Fetching all data from database...');
        const snapshot = await rootRef.once('value');
        const data = snapshot.val();
        
        if (!data) {
            console.log('⚠️  No data found in the database');
            return;
        }
        
        console.log('✅ Data retrieved successfully!');
        console.log('📈 Database structure overview:');
        
        // Analyze structure
        const keys = Object.keys(data);
        keys.forEach(key => {
            const value = data[key];
            if (typeof value === 'object' && value !== null) {
                const subKeys = Object.keys(value);
                console.log(`  📁 ${key}: ${subKeys.length} items`);
                if (subKeys.length > 0) {
                    console.log(`    📄 Sample keys: ${subKeys.slice(0, 3).join(', ')}${subKeys.length > 3 ? '...' : ''}`);
                }
            } else {
                console.log(`  📝 ${key}: ${typeof value}`);
            }
        });
        
        // Save to local file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `firebase-data-${timestamp}.json`;
        const filepath = path.join(__dirname, filename);
        
        console.log('💾 Saving data to local file...');
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        
        console.log(`✅ Data saved to: ${filename}`);
        console.log(`📊 Total data size: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`);
        
        // Create a summary file as well
        const summary = {
            extractionTime: new Date().toISOString(),
            databaseURL: firebaseConfig.databaseURL,
            structure: {},
            totalRecords: 0
        };
        
        keys.forEach(key => {
            const value = data[key];
            if (typeof value === 'object' && value !== null) {
                const subKeys = Object.keys(value);
                summary.structure[key] = {
                    type: 'collection',
                    count: subKeys.length,
                    sampleKeys: subKeys.slice(0, 5),
                    sampleRecord: subKeys.length > 0 ? value[subKeys[0]] : null
                };
                summary.totalRecords += subKeys.length;
            } else {
                summary.structure[key] = {
                    type: typeof value,
                    value: value
                };
            }
        });
        
        const summaryFilename = `firebase-summary-${timestamp}.json`;
        fs.writeFileSync(path.join(__dirname, summaryFilename), JSON.stringify(summary, null, 2));
        
        console.log(`📋 Summary saved to: ${summaryFilename}`);
        console.log(`🎯 Total records across all collections: ${summary.totalRecords}`);
        
        return {
            dataFile: filename,
            summaryFile: summaryFilename,
            data: data,
            summary: summary
        };
        
    } catch (error) {
        console.error('❌ Error extracting Firebase data:', error);
        
        if (error.code === 'PERMISSION_DENIED') {
            console.log('🔒 Permission denied. This might be due to:');
            console.log('   - Database security rules blocking access');
            console.log('   - Missing authentication');
            console.log('   - Incorrect database URL');
        } else if (error.code === 'NETWORK_ERROR') {
            console.log('🌐 Network error. Check your internet connection.');
        }
        
        throw error;
    } finally {
        // Clean up
        if (admin.apps.length > 0) {
            await admin.app().delete();
        }
    }
}

// Run the extraction
if (require.main === module) {
    extractFirebaseData()
        .then((result) => {
            if (result) {
                console.log('🎉 Data extraction completed successfully!');
                console.log(`📁 Files created: ${result.dataFile}, ${result.summaryFile}`);
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Extraction failed:', error.message);
            process.exit(1);
        });
}

module.exports = { extractFirebaseData };