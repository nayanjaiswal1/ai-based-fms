# 📧 Gmail Email Integration

Automatically extract transactions and orders from your Gmail inbox!

## ✨ What It Does

Connect your Gmail account and let the system automatically:
- 💳 **Extract Transactions** - Detect payments, purchases, bills, and refunds
- 📦 **Parse Orders** - Extract e-commerce order details and tracking info
- 🤖 **AI-Powered** - Use pattern matching + AI for accurate extraction
- 🔄 **Auto-Sync** - Keep your finances up-to-date automatically

## 🚀 Getting Started

### For Users

1. **Connect Gmail**
   - Go to Settings → Email Integration
   - Click "Connect Gmail Account"
   - Authorize the app in Google's consent screen
   - You're connected! ✅

2. **Sync Emails**
   - Click "Sync Now" to fetch emails
   - System processes last 30 days by default
   - Transactions appear in your transaction list

3. **Customize Settings**
   - Enable/disable auto-sync
   - Set sync interval (e.g., every hour)
   - Filter by senders (e.g., only Amazon emails)
   - Choose what to parse (transactions, orders, or both)

### For Developers

See [docs/EMAIL_INTEGRATION_SETUP.md](docs/EMAIL_INTEGRATION_SETUP.md) for complete setup instructions.

**Quick setup:**
```bash
# 1. Create Google OAuth credentials
# 2. Add to backend/.env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
OPENAI_API_KEY=sk-... # Optional

# 3. Restart backend
cd backend && npm run start:dev
```

## 📊 What Gets Extracted

### Transactions
- **Amount**: ₹1,234.56 or $99.99
- **Date**: Transaction date
- **Merchant**: Who you paid (Amazon, Zomato, etc.)
- **Type**: Income or Expense
- **Description**: Email subject
- **Confidence**: How sure we are (0.7-1.0)

### Orders
- **Order Number**: #404-1234567-8901234
- **Merchant**: Store name
- **Total Amount**: Order total
- **Items**: What you ordered
- **Tracking Number**: For deliveries
- **Delivery Date**: Expected arrival

## 🛡️ Security & Privacy

### What We Access
- ✅ Read your emails (to extract transaction data)
- ✅ Your email address (to identify your account)

### What We DON'T Access
- ❌ Can't send emails from your account
- ❌ Can't delete your emails
- ❌ Can't access contacts or calendar
- ❌ Tokens stored encrypted, never shared

### How It Works
1. **OAuth 2.0** - Google's secure authorization (no passwords!)
2. **Incremental Sync** - Only fetches NEW emails (efficient)
3. **Local Processing** - Transactions stored in YOUR database
4. **Revoke Anytime** - Disconnect in app settings or Google Account

## 💡 Supported Merchants

### E-commerce
- 🛒 Amazon, Flipkart, Myntra, Ajio
- 📱 Apple Store, Google Play

### Food & Groceries
- 🍔 Zomato, Swiggy
- 🛒 BigBasket, Grofers

### Transport
- 🚗 Uber, Ola
- ✈️ MakeMyTrip, Goibibo

### Payments & Utilities
- 💰 Paytm, PhonePe, Google Pay
- 💡 Electricity, Water, Mobile recharge

### Subscriptions
- 🎬 Netflix, Prime Video, Hotstar
- 🎵 Spotify, YouTube Premium

**And many more!** The system automatically detects new merchants from email domains.

## 📈 How Accurate Is It?

### Pattern-Based Extraction
- **Speed**: ⚡ Instant
- **Accuracy**: 70-80%
- **Cost**: Free
- **Best for**: Standard email formats

### AI-Powered Extraction
- **Speed**: 2-3 seconds
- **Accuracy**: 85-95%
- **Cost**: ~$0.002 per email
- **Best for**: Complex or unusual formats

The system tries pattern matching first, then falls back to AI if needed.

## ⚙️ Settings & Preferences

### Auto-Sync
- **Enabled**: Automatically fetch new emails periodically
- **Interval**: How often to sync (15 min to 24 hours)
- **Default**: 1 hour

### Parsing Options
- **Parse Transactions**: Extract payment/purchase info
- **Parse Orders**: Extract e-commerce order details
- **Default**: Both enabled

### Filters
- **Filter by Senders**: Only process emails from specific domains
  - Example: `amazon.in, zomato.com`
- **Filter by Labels**: Only process emails with certain Gmail labels
  - Example: `INBOX, CATEGORY_PURCHASES`

### Notifications
- **Notify on New Transactions**: Get alerted when transactions are found
- **Email Summary**: Daily/weekly summary of extracted data

## 🔧 Troubleshooting

### No transactions found?
- ✅ Check date range (try last 60 days)
- ✅ Verify emails match patterns (payment, order, invoice keywords)
- ✅ Enable AI extraction (add OpenAI API key)
- ✅ Check filter settings aren't too restrictive

### Connection issues?
- ✅ Reconnect your Gmail account
- ✅ Check you approved all permissions
- ✅ Verify account is a test user (during development)

### Duplicate transactions?
- ✅ System tracks which emails are processed
- ✅ Uses Gmail History API to avoid re-processing
- ✅ If duplicates occur, use the dedupe feature

## 📞 Support

### For Users
- Check in-app help section
- Contact support: support@yourdomain.com

### For Developers
- See [backend/src/modules/email/README.md](backend/src/modules/email/README.md)
- Check logs: `docker-compose logs -f backend | grep Email`
- API docs: http://localhost:3000/api/docs

## 🎯 Coming Soon

- [ ] Outlook/Office 365 support
- [ ] Auto-categorization of transactions
- [ ] Receipt attachment OCR
- [ ] Scheduled reports
- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Bank statement PDF parsing

## ❓ FAQ

**Q: Is my data safe?**
A: Yes! We use OAuth 2.0 (industry standard), encrypt tokens, and never store passwords.

**Q: Can you read all my emails?**
A: Technically yes, but we only process emails with transaction/order keywords.

**Q: Does it cost money?**
A: Pattern matching is free. AI extraction costs ~$0.002/email (only used as fallback).

**Q: What if I disconnect?**
A: Your existing transactions stay. New emails won't be processed. Reconnect anytime!

**Q: Can I use multiple Gmail accounts?**
A: Yes! Connect as many as you want. Each syncs independently.

**Q: Does it work with other email providers?**
A: Currently Gmail only. Outlook/Yahoo support coming soon!

---

**Built with ❤️ to make finance tracking effortless**

[Setup Guide](docs/EMAIL_INTEGRATION_SETUP.md) | [Developer Docs](backend/src/modules/email/README.md) | [API Reference](http://localhost:3000/api/docs)
