# Firebase Data Extraction Setup

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install firebase-admin
   ```

2. **Get service account key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `chatgpt-extractor`
   - Go to **Project Settings** → **Service Accounts** tab
   - Click **"Generate New Private Key"**
   - Save the downloaded file as `serviceAccountKey.json` in this directory

3. **Run extraction**:
   ```bash
   node extract-firestore-data.js
   ```

## What It Does

- Connects to your specific database: `chatgpt-extractor-database`
- Discovers existing collections automatically
- Extracts all documents from: `extractions`, `feedback`, `users`
- Saves data to timestamped JSON files
- Creates summary with statistics

## Expected Output

```
🔥 Firebase Firestore Data Extractor
=====================================

📁 Service account loaded: chatgpt-extractor
🗄️  Connected to database: chatgpt-extractor-database
🔍 Attempting to discover collections...
✅ Found collections: extractions, feedback, users

🚀 Starting extraction of 3 collections...

📥 Extracting collection: extractions
   ✅ Extracted 15 documents
   📋 Sample fields: title, url, messageCount, messages, timestamp

📥 Extracting collection: feedback
   ✅ Extracted 3 documents
   📋 Sample fields: rating, comment, timestamp

📥 Extracting collection: users
   ✅ Extracted 8 documents
   📋 Sample fields: userId, email, lastActive

💾 Data saved to: firestore-extract-2025-05-28T01-30-45-123Z.json
📊 Summary saved to: firestore-summary-2025-05-28T01-30-45-123Z.json

🎉 Extraction Complete!
======================
📊 Total Collections: 3
📄 Total Documents: 26
⏱️  Processing Time: 2.45s
🗄️  Database: chatgpt-extractor-database
```

## Troubleshooting

### Service Account Key Missing
```
Error: Service account file not found: ./serviceAccountKey.json
```
**Solution**: Download the service account key from Firebase Console and save as `serviceAccountKey.json`

### Permission Denied
```
Error: Missing or insufficient permissions
```
**Solution**: Make sure your service account has Firestore permissions in Firebase Console → IAM

### Wrong Database
```
Collection 'extractions' is empty
```
**Solution**: The script defaults to `chatgpt-extractor-database`. Check if your data is in a different database.

## Next Steps

Once you have the extracted data:
1. Review the JSON files to understand your data structure
2. Use this data to design the Pulse Grid integration
3. Update the application to connect to Firestore in real-time