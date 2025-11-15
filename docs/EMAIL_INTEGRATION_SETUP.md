# Gmail Email Integration Setup Guide

This guide explains how to set up Gmail OAuth integration to automatically extract transactions and orders from your emails.

## Overview

The Email Integration feature allows users to:
- Connect their Gmail account using OAuth 2.0 (secure, no password required)
- Automatically parse emails for transaction information (payments, purchases, bills)
- Extract order information (e-commerce orders, deliveries)
- AI-powered extraction for better accuracy
- Incremental sync for efficiency (only fetches new emails)

## Architecture

### Backend Components

1. **EmailConnection Entity** (`backend/src/database/entities/email-connection.entity.ts`)
   - Stores Gmail connection details
   - OAuth tokens (access & refresh)
   - Sync preferences and statistics

2. **GmailOAuthService** (`backend/src/modules/email/gmail-oauth.service.ts`)
   - Handles Gmail OAuth flow
   - Token management and refresh
   - Gmail API integration

3. **EmailParserService** (`backend/src/modules/email/email-parser.service.ts`)
   - Pattern-based extraction (fast, no API cost)
   - AI-powered extraction (using OpenAI for complex emails)
   - Supports Indian Rupee (₹) and USD ($)
   - Extracts amounts, dates, merchants, order numbers

4. **EmailService** (`backend/src/modules/email/email.service.ts`)
   - Orchestrates OAuth flow
   - Manages email connections
   - Handles sync operations

### API Endpoints

```
GET  /api/email/gmail/auth-url        - Get Gmail OAuth authorization URL
POST /api/email/gmail/callback        - Handle OAuth callback with code
GET  /api/email/connections           - List all email connections
POST /api/email/sync                  - Trigger email sync
PATCH /api/email/connections/:id/preferences - Update sync preferences
GET  /api/email/connections/:id/status - Get sync status
DELETE /api/email/connections/:id     - Disconnect email
```

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "FMS Email Integration"

### Step 2: Enable Gmail API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (or Internal if you have Google Workspace)
3. Fill in:
   - App name: `Finance Management System`
   - User support email: Your email
   - Developer contact: Your email
4. **Scopes**: Add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
5. **Test users**: Add your Gmail address for testing
6. Save and continue

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `FMS Web Client`
5. **Authorized redirect URIs**: Add these:
   - Development: `http://localhost:5173/email/callback`
   - Production: `https://yourdomain.com/email/callback`
6. Click **Create**
7. **Save the Client ID and Client Secret** - you'll need them next!

### Step 5: Configure Backend Environment

Add these variables to your `backend/.env` file:

```env
# Google OAuth Credentials (from Step 4)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# OAuth Redirect URI (must match the one in Google Console)
GOOGLE_REDIRECT_URI=http://localhost:5173/email/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# OpenAI API Key (optional, for AI-powered extraction)
OPENAI_API_KEY=sk-your-openai-key-here
```

### Step 6: Restart Backend

```bash
cd backend
npm run start:dev
```

The backend will now accept Gmail OAuth connections!

## Usage Flow

### Frontend Integration

1. **Get Auth URL**
   ```typescript
   const response = await api.get('/api/email/gmail/auth-url');
   window.location.href = response.data.authUrl; // Redirect user to Google
   ```

2. **Handle Callback** (in your `/email/callback` route)
   ```typescript
   const urlParams = new URLSearchParams(window.location.search);
   const code = urlParams.get('code');

   if (code) {
     await api.post('/api/email/gmail/callback', { code });
     // Connection created! Redirect to email settings
   }
   ```

3. **Trigger Sync**
   ```typescript
   const result = await api.post('/api/email/sync', {
     connectionId: 'connection-uuid',
     daysBack: 30 // optional, default 30
   });

   console.log(`Processed ${result.emailsProcessed} emails`);
   console.log(`Found ${result.transactionsExtracted} transactions`);
   console.log(`Found ${result.ordersExtracted} orders`);
   ```

### Sample Response

```json
{
  "success": true,
  "emailsProcessed": 47,
  "transactionsExtracted": 12,
  "ordersExtracted": 5,
  "transactions": [
    {
      "description": "Amazon Order Confirmation",
      "amount": 2499.00,
      "date": "2025-11-14",
      "type": "expense",
      "merchant": "Amazon",
      "confidence": 0.9,
      "metadata": {
        "from": "shipment-tracking@amazon.in",
        "subject": "Your Amazon.in order of ₹2,499.00",
        "orderNumber": "404-1234567-8901234"
      }
    }
  ]
}
```

## Sync Preferences

Users can customize sync behavior:

```typescript
await api.patch(`/api/email/connections/${connectionId}/preferences`, {
  autoSync: true,
  syncIntervalMinutes: 60,
  parseTransactions: true,
  parseOrders: true,
  filterLabels: ['INBOX', 'CATEGORY_PURCHASES'],
  filterSenders: ['amazon.in', 'zomato.com'],
  notifyOnNewTransactions: true
});
```

## Supported Email Patterns

### Transaction Emails

The parser detects:
- **Keywords**: payment, transaction, charged, paid, receipt, invoice, bill
- **Amounts**: ₹1,234.56, Rs. 1234, $99.99, USD 100
- **Dates**: Various formats (DD/MM/YYYY, YYYY-MM-DD, "15 Nov 2025")
- **Merchants**: Extracted from sender domain

### Order Emails

The parser detects:
- **Keywords**: "order confirmed", "order placed", "tracking number"
- **Order Numbers**: Patterns like "Order #12345", "Order ID: ABC-123"
- **Tracking Numbers**: "Tracking #", "Tracking ID"

### Supported Merchants (Auto-detected)

- Amazon, Flipkart, Myntra
- Zomato, Swiggy
- Uber, Ola
- Paytm, PhonePe
- Netflix, Spotify
- And any others (extracted from email domain)

## AI-Powered Extraction

If `OPENAI_API_KEY` is configured, the system falls back to AI extraction for complex emails:

- Better accuracy for unusual formats
- Multi-language support
- Contextual understanding
- Higher confidence scores (0.85 vs 0.7 for pattern-based)

**Cost**: ~$0.002 per email (GPT-3.5-turbo)

## Performance Optimizations

1. **Incremental Sync**: Uses Gmail History API to fetch only new emails
2. **Caching**: Stores `lastSyncHistoryId` to avoid re-processing
3. **Pattern-First**: Tries fast pattern matching before expensive AI
4. **Batch Processing**: Processes 50 emails at a time to avoid quota issues

## Security Considerations

1. **OAuth Tokens**: Stored encrypted in database
2. **Automatic Refresh**: Access tokens refreshed automatically when expired
3. **Scopes**: Minimum required (readonly + email)
4. **No Password Storage**: OAuth eliminates password security risks
5. **User Consent**: Google shows what access is granted

## Troubleshooting

### "Access blocked: This app hasn't been verified"

**Solution**: During development, you need to:
1. Add your Gmail as a test user in OAuth consent screen
2. Click "Advanced" → "Go to [App Name] (unsafe)" when prompted
3. Or publish the app (requires Google verification)

### "Tokens expired"

**Solution**: The system auto-refreshes using the refresh token. If it fails:
1. User needs to reconnect their Gmail account
2. Check that `GOOGLE_CLIENT_SECRET` is correct

### "No transactions found"

**Possible causes**:
1. Emails don't match patterns (add more keywords)
2. AI extraction disabled (add `OPENAI_API_KEY`)
3. Emails older than sync range (increase `daysBack`)
4. Check `filterSenders` preferences (might be too restrictive)

### Rate Limiting

Gmail API limits:
- **250 quota units per user per second**
- **1 billion quota units per day**
- Each `messages.list`: 5 units
- Each `messages.get`: 5 units

**Solution**: Implemented exponential backoff and batch processing.

## Testing

### Test OAuth Flow

```bash
# 1. Get auth URL
curl http://localhost:3000/api/email/gmail/auth-url

# 2. Visit URL in browser, approve access
# 3. Copy the code from redirect URL
# 4. Exchange code for tokens
curl -X POST http://localhost:3000/api/email/gmail/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "4/0A..."}'
```

### Test Sync

```bash
curl -X POST http://localhost:3000/api/email/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"connectionId": "uuid", "daysBack": 7}'
```

## Database Schema

The `email_connections` table stores:

```sql
CREATE TABLE email_connections (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  provider VARCHAR NOT NULL, -- 'gmail'
  email VARCHAR NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  tokenExpiresAt TIMESTAMP,
  status VARCHAR, -- 'connected', 'disconnected', 'error', 'syncing'
  lastSyncAt TIMESTAMP,
  lastSyncHistoryId VARCHAR, -- For incremental sync
  transactionsExtracted INTEGER DEFAULT 0,
  ordersExtracted INTEGER DEFAULT 0,
  preferences JSONB,
  syncStats JSONB,
  ...
);
```

## Future Enhancements

- [ ] Outlook/Office 365 support
- [ ] Automatic transaction categorization
- [ ] Duplicate detection
- [ ] Receipt attachment extraction
- [ ] Scheduled auto-sync (background jobs)
- [ ] Email rules/filters configuration
- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Bank statement PDF parsing

## API Reference

See Swagger docs at `http://localhost:3000/api/docs` for complete API documentation.

## Support

For issues or questions:
1. Check backend logs: `docker-compose logs -f backend`
2. Check database: `docker exec -it postgres_new psql -U fms_user -d fms_db`
3. Verify environment variables are set correctly
4. Ensure Gmail API is enabled in Google Cloud Console

---

**Note**: This feature requires Google OAuth credentials. Users must have a Google account to use Gmail integration.
