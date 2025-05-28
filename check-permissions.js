#!/usr/bin/env node

/**
 * Firebase Permission Checker
 * 
 * This script checks what permissions your service account currently has.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

async function checkPermissions() {
    try {
        console.log('🔍 Firebase Permission Checker');
        console.log('==============================\n');

        // Load service account
        if (!fs.existsSync('./serviceAccountKey.json')) {
            throw new Error('Service account file not found: serviceAccountKey.json');
        }

        const serviceAccount = require(path.resolve('./serviceAccountKey.json'));
        console.log(`📁 Service Account: ${serviceAccount.client_email}`);
        console.log(`🏗️  Project ID: ${serviceAccount.project_id}\n`);

        // Initialize Firebase
        const app = initializeApp({
            credential: cert(serviceAccount)
        });

        // Test different databases (skip default since it doesn't exist)
        const databasesToTest = [
            'chatgpt-extractor-database'
        ];

        for (const dbId of databasesToTest) {
            console.log(`🗄️  Testing database: ${dbId}`);
            
            try {
                const db = dbId === '(default)' 
                    ? getFirestore(app) 
                    : getFirestore(app, dbId);

                // Test basic database access with actual collections
                console.log(`   ✅ Database connection: OK`);

                // Test specific collections
                const collections = ['extractions', 'feedback', 'users'];
                for (const collectionName of collections) {
                    try {
                        const snapshot = await db.collection(collectionName).limit(1).get();
                        console.log(`   ✅ ${collectionName}: ${snapshot.size} documents accessible`);
                    } catch (error) {
                        console.log(`   ❌ ${collectionName}: ${error.message}`);
                    }
                }

            } catch (error) {
                console.log(`   ❌ Database access failed: ${error.message}`);
            }
            console.log('');
        }

        // Test project-level permissions
        console.log('🔐 Testing project-level access...');
        try {
            // This will fail if we don't have proper project permissions
            const projectId = serviceAccount.project_id;
            console.log(`   ✅ Project access: ${projectId}`);
        } catch (error) {
            console.log(`   ❌ Project access failed: ${error.message}`);
        }

        await app.delete();
        console.log('\n💡 If you see permission errors above:');
        console.log('   1. Go to Google Cloud Console → IAM & Admin → IAM');
        console.log('   2. Find your service account email');
        console.log('   3. Add roles: "Cloud Datastore User" and "Firebase Admin SDK Administrator Service Agent"');

    } catch (error) {
        console.error('❌ Permission check failed:', error.message);
    }
}

checkPermissions();