# ChatGPT Enterprise Tracker - Firebase Data Schema

## Overview
This document describes the complete data structure stored in Firebase for the ChatGPT Enterprise Chrome Extension. The extension uses Firebase Firestore for cloud storage with REST API authentication.

## Firebase Configuration
- **Project ID:** `chatgpt-extractor`
- **Database:** `chatgpt-extractor-database`
- **Authentication:** Anonymous users with 90-day sessions
- **Collections:** `users`, `extractions`, `feedback`

## Collection Schemas

### 1. Users Collection (`/users/{userId}`)

Stores user profiles and metadata for each Chrome extension user.

```typescript
interface UserProfile {
  userId: string                     // Firebase UID (document ID)
  createdAt: string                  // ISO timestamp of account creation
  lastActiveAt: string               // ISO timestamp of last activity
  deviceIds: string[]                // Array of device identifiers
  extractionCount: number            // Total extractions by user
  feedbackCount: number              // Total feedback entries by user
  preferences: {
    autoSync: boolean                // Auto-sync preference
    encryptionEnabled: boolean       // Encryption preference (future)
  }
}
```

**Sample User Document:**
```json
{
  "userId": "abc123def456",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastActiveAt": "2024-01-20T14:22:33.000Z",
  "deviceIds": ["device-1705308600000-xyz789"],
  "extractionCount": 15,
  "feedbackCount": 8,
  "preferences": {
    "autoSync": true,
    "encryptionEnabled": false
  }
}
```

### 2. Extractions Collection (`/extractions/{extractionId}`)

Stores extracted ChatGPT conversations with thread owner attribution.

```typescript
interface ExtractedDataFirestore {
  // Core conversation data
  id: string                         // Conversation ID
  threadId: string                   // ChatGPT thread ID
  title: string                      // Conversation title
  messageCount: number               // Number of messages
  timestamp: string                  // ISO timestamp of extraction
  url?: string                       // ChatGPT URL
  
  // Conversation messages
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: string               // ISO timestamp (optional)
  }[]
  
  // IALS Thread Owner Attribution
  threadOwner?: {
    id: string                       // User ID
    name: string                     // Full name
    email: string                    // Email address
    organization?: string            // Organization name
    isOther?: boolean                // True if "Other" option was used
  }
  
  // Attached feedback (if exists)
  feedback?: {
    threadId: string
    timestamp: string
    rating: number                   // 1-5 star rating
    sentiment: 'helpful' | 'not-helpful' | 'neutral'
    tags: string[]                   // Array of feedback tags
    comment: string                  // User comment
    messageCount: number
    extractionTimestamp: string
  }
  
  // Firebase metadata
  extractionId: string               // Same as document ID
  userId: string                     // Owner user ID
  deviceId: string                   // Device that created extraction
  syncedAt: string                   // ISO timestamp of sync
  isEncrypted: boolean               // Encryption status (always false currently)
}
```

**Sample Extraction Document:**
```json
{
  "id": "thread-ABC123XYZ",
  "threadId": "thread-ABC123XYZ",
  "title": "Help with React Component Design",
  "messageCount": 8,
  "messages": [
    {
      "role": "user",
      "content": "How do I create a reusable button component in React?",
      "timestamp": "2024-01-20T10:15:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Here's how you can create a reusable button component in React:\n\n```jsx\nimport React from 'react';\n\nconst Button = ({ children, variant = 'primary', onClick, disabled = false }) => {\n  const baseClasses = 'px-4 py-2 rounded font-medium';\n  const variantClasses = {\n    primary: 'bg-blue-500 text-white hover:bg-blue-600',\n    secondary: 'bg-gray-500 text-white hover:bg-gray-600'\n  };\n\n  return (\n    <button\n      className={`${baseClasses} ${variantClasses[variant]}`}\n      onClick={onClick}\n      disabled={disabled}\n    >\n      {children}\n    </button>\n  );\n};\n\nexport default Button;\n```\n\nThis component is reusable and accepts props for customization.",
      "timestamp": "2024-01-20T10:15:30.000Z"
    }
  ],
  "timestamp": "2024-01-20T10:20:00.000Z",
  "url": "https://chat.openai.com/c/thread-ABC123XYZ",
  "threadOwner": {
    "id": "user456",
    "name": "John Smith",
    "email": "john.smith@company.com",
    "organization": "Acme Corporation",
    "isOther": false
  },
  "extractionId": "ext_20240120102000_xyz789",
  "userId": "firebase_user_uid_123",
  "deviceId": "device-1705308600000-xyz789",
  "syncedAt": "2024-01-20T10:20:05.000Z",
  "isEncrypted": false
}
```

### 3. Feedback Collection (`/feedback/{feedbackId}`)

Stores quality feedback and ratings for extracted conversations.

```typescript
interface FeedbackDataFirestore {
  // Core feedback data
  id: string                         // Feedback ID
  threadId: string                   // Associated thread ID
  timestamp: string                  // ISO timestamp
  rating: number                     // 1-5 star rating
  sentiment: 'helpful' | 'not-helpful' | 'neutral'
  tags: string[]                     // Feedback tags
  comment: string                    // User comment
  messageCount: number               // Messages in conversation
  extractionTimestamp: string        // When conversation was extracted
  
  // Extraction reference
  extraction: {
    title: string                    // Conversation title
    timestamp: number                // Extraction timestamp (number)
  }
  
  // Firebase metadata
  userId: string                     // Owner user ID
  extractionId: string               // Same as threadId
  syncedAt: string                   // ISO timestamp of sync
}
```

**Sample Feedback Document:**
```json
{
  "id": "feedback_xyz789abc",
  "threadId": "thread-ABC123XYZ",
  "timestamp": "2024-01-20T11:30:00.000Z",
  "rating": 5,
  "sentiment": "helpful",
  "tags": ["react", "components", "frontend", "helpful"],
  "comment": "Excellent explanation with clear examples and working code",
  "messageCount": 8,
  "extractionTimestamp": "2024-01-20T10:20:00.000Z",
  "extraction": {
    "title": "Help with React Component Design",
    "timestamp": 1705748400000
  },
  "userId": "firebase_user_uid_123",
  "extractionId": "thread-ABC123XYZ",
  "syncedAt": "2024-01-20T11:30:05.000Z"
}
```

## Authentication Schema

```typescript
interface FirebaseUser {
  uid: string                        // Firebase user ID
  email?: string                     // User email (null for anonymous)
  emailVerified: boolean             // Email verification status
  isAnonymous: boolean               // Anonymous user flag (always true)
  createdAt: string                  // Account creation timestamp
  lastLoginAt: string                // Last login timestamp
  idToken: string                    // JWT token for API calls
  refreshToken: string               // Token for refreshing sessions
  expiresIn: string                  // Token expiry duration ("3600")
}
```

## Data Relationships

```
User (1) ──── (Many) Extractions
User (1) ──── (Many) Feedback
Extraction (1) ──── (0-1) Feedback  [via threadId]
ThreadOwner (1) ──── (Many) Extractions  [IALS attribution]
```

## Query Patterns

### Common Queries for UI
1. **Get user's extractions:** `extractions?where[userId]={userId}&orderBy=timestamp desc`
2. **Get feedback for extraction:** `feedback?where[threadId]={threadId}`
3. **Get extractions by thread owner:** `extractions?where[threadOwner.email]={email}`
4. **Get recent activity:** `extractions?where[userId]={userId}&orderBy=syncedAt desc&limit=10`

### Aggregation Opportunities
- Total extractions per user
- Average rating per thread owner
- Most active organizations
- Conversation length trends
- Feedback sentiment analysis

## CSV Export Schema

The extension exports data in CSV format with these columns:

| Column | Type | Description |
|--------|------|-------------|
| Thread ID | string | ChatGPT thread identifier |
| Title | string | Conversation title |
| Message Count | number | Number of messages |
| Timestamp | string | ISO timestamp |
| URL | string | ChatGPT conversation URL |
| Thread Owner Name | string | IALS attendee name |
| Thread Owner Email | string | IALS attendee email |
| Thread Owner Organization | string | Organization name |
| Is External User | string | "Yes"/"No" for Other option |
| Feedback Rating | number | 1-5 stars (if exists) |
| Feedback Sentiment | string | helpful/neutral/not-helpful |
| Feedback Comment | string | User comment |
| Feedback Tags | string | Comma-separated tags |

## Security Notes

- **Authentication:** Anonymous Firebase users with 90-day automatic session renewal
- **Authorization:** Users can only access their own data via userId filtering
- **API Access:** Firebase REST API with structured queries
- **Encryption:** Infrastructure in place but not currently enabled
- **Rate Limiting:** Standard Firebase quotas apply

## Technical Implementation

- **API:** Firebase Firestore REST API
- **SDK:** Custom REST implementation (not Firebase SDK)
- **Offline:** Local storage with sync when online
- **Conflict Resolution:** Last-write-wins based on syncedAt timestamp
- **Pagination:** Limit-based (default 50 items per request)

This schema enables comprehensive analytics on ChatGPT usage patterns, conversation quality, and user engagement across IALS meeting participants.