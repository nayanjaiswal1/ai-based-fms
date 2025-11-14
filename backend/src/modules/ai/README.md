# AI Module

## Overview
The AI module leverages OpenAI's GPT-3.5-turbo to provide intelligent features like automatic transaction categorization, receipt parsing, financial insights, and conversational transaction creation.

## Features
- **Auto-Categorization**: Automatically categorize transactions based on description
- **Receipt Parsing**: Extract transaction details from receipt images
- **Financial Insights**: Generate personalized financial insights
- **AI Chat**: Conversational interface for financial queries
- **Learning System**: Improves accuracy based on user feedback
- **Confidence Scoring**: Provides confidence scores for suggestions

## Module Structure

```
ai/
├── ai.module.ts                # Module definition
├── ai.controller.ts            # REST API endpoints
├── ai.service.ts               # OpenAI integration
├── dto/                        # Data Transfer Objects
│   ├── categorize.dto.ts       # Categorization request
│   ├── chat.dto.ts             # Chat request
│   ├── parse-receipt.dto.ts    # Receipt parsing request
│   └── feedback.dto.ts         # User feedback
└── README.md                   # This file
```

## API Endpoints

### POST /api/ai/categorize
Automatically categorize a transaction.

**Request Body:**
```json
{
  "description": "Starbucks Coffee",
  "amount": 5.50,
  "merchant": "Starbucks",
  "date": "2025-01-15"
}
```

**Response:**
```json
{
  "categoryId": "uuid",
  "categoryName": "Food & Dining",
  "subcategoryName": "Coffee Shops",
  "confidence": 0.95,
  "reasoning": "Transaction at Starbucks indicates coffee purchase, which falls under Food & Dining category"
}
```

### POST /api/ai/chat
Chat with AI assistant about finances.

**Request Body:**
```json
{
  "message": "How much did I spend on groceries last month?",
  "conversationId": "uuid" // optional, for conversation context
}
```

**Response:**
```json
{
  "response": "You spent $450 on groceries last month. This is 10% higher than your average monthly grocery spending of $410.",
  "conversationId": "uuid",
  "suggestions": [
    {
      "type": "BUDGET",
      "message": "Consider setting a budget of $500 for groceries"
    }
  ],
  "data": {
    "totalSpent": 450.00,
    "average": 410.00,
    "variance": 40.00
  }
}
```

### POST /api/ai/parse-receipt
Parse receipt image to extract transaction details.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/receipt.jpg",
  "imageBase64": "base64-encoded-image" // alternative to imageUrl
}
```

**Response:**
```json
{
  "merchant": "Walmart",
  "amount": 127.43,
  "date": "2025-01-15",
  "items": [
    {
      "name": "Milk",
      "quantity": 1,
      "price": 3.99
    },
    {
      "name": "Bread",
      "quantity": 2,
      "price": 2.50
    }
  ],
  "suggestedCategory": "Groceries",
  "confidence": 0.88
}
```

### POST /api/ai/insights
Generate personalized financial insights.

**Request Body:**
```json
{
  "period": "LAST_MONTH",
  "categories": ["all"] // or specific category IDs
}
```

**Response:**
```json
{
  "insights": [
    {
      "type": "OVERSPENDING",
      "category": "Dining Out",
      "message": "Your dining out spending increased 35% compared to last month",
      "severity": "WARNING",
      "suggestion": "Consider cooking at home more often to save $200/month"
    },
    {
      "type": "SAVINGS_OPPORTUNITY",
      "category": "Subscriptions",
      "message": "You have 3 unused subscriptions costing $45/month",
      "severity": "INFO",
      "suggestion": "Cancel unused subscriptions to save $540/year"
    },
    {
      "type": "POSITIVE_TREND",
      "category": "Savings",
      "message": "Great job! Your savings rate improved to 25%",
      "severity": "SUCCESS",
      "suggestion": "Maintain this rate to reach your financial goals"
    }
  ],
  "financialHealthScore": 78,
  "summary": "Your financial health is good. Focus on reducing dining out expenses."
}
```

### POST /api/ai/feedback
Submit feedback on AI categorization.

**Request Body:**
```json
{
  "transactionId": "uuid",
  "suggestedCategoryId": "uuid",
  "actualCategoryId": "uuid",
  "wasAccurate": false,
  "comment": "Should be Entertainment, not Food"
}
```

**Response:**
```json
{
  "message": "Thank you for your feedback. The AI will learn from this.",
  "feedbackId": "uuid"
}
```

### GET /api/ai/suggestions
Get AI suggestions for improving finances.

**Response:**
```json
{
  "suggestions": [
    {
      "type": "BUDGET_RECOMMENDATION",
      "title": "Set a dining budget",
      "description": "Based on your spending pattern, set a $400 monthly budget for dining",
      "potentialSavings": 150.00,
      "priority": "HIGH"
    },
    {
      "type": "SUBSCRIPTION_AUDIT",
      "title": "Review subscriptions",
      "description": "You have multiple streaming services. Consider consolidating.",
      "potentialSavings": 30.00,
      "priority": "MEDIUM"
    }
  ]
}
```

## AI Features in Detail

### 1. Auto-Categorization

**How it works:**
1. User creates transaction with description
2. AI analyzes description, amount, merchant, date
3. Compares against user's historical categorization
4. Uses GPT-3.5 to suggest category
5. Returns category with confidence score

**Confidence Levels:**
- **High (>0.9)**: Auto-apply category
- **Medium (0.7-0.9)**: Suggest to user
- **Low (<0.7)**: Let user categorize manually

**Learning:**
- Stores user's categorization choices
- Builds user-specific patterns
- Improves accuracy over time

### 2. Receipt Parsing

**Supported formats:**
- JPEG, PNG images
- PDF receipts
- Email attachments

**Extracted information:**
- Merchant name
- Total amount
- Date
- Individual items (if itemized)
- Tax amount
- Payment method

### 3. Financial Insights

**Insight Types:**
- **Overspending**: Categories exceeding normal patterns
- **Savings Opportunities**: Areas to reduce spending
- **Positive Trends**: Improved financial behaviors
- **Anomalies**: Unusual transactions
- **Predictions**: Future spending forecasts

**Analysis Factors:**
- Historical spending patterns
- Budget adherence
- Income vs. expenses
- Savings rate
- Category trends
- Seasonal variations

### 4. AI Chat

**Capabilities:**
- Answer financial questions
- Create transactions via conversation
- Provide spending analysis
- Offer financial advice
- Search transaction history
- Generate reports

**Example Conversations:**
```
User: "Add $50 grocery expense"
AI: "I've added a $50 grocery expense for today. Would you like to add any details?"

User: "How much did I spend on coffee this month?"
AI: "You spent $67 on coffee this month across 15 transactions. Your average coffee expense is $4.47."

User: "Show me my biggest expenses last week"
AI: "Your top 3 expenses last week were:
1. Rent - $1,200
2. Groceries - $150
3. Gas - $80"
```

## Database Entities

### AI Categorization Feedback
**Table:** `ai_categorization_feedback`

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `transactionId` (UUID, Foreign Key)
- `description` (VARCHAR)
- `suggestedCategoryId` (UUID)
- `actualCategoryId` (UUID)
- `wasAccurate` (BOOLEAN)
- `comment` (TEXT, nullable)
- `createdAt` (TIMESTAMP)

**Purpose:** Train and improve AI model accuracy

## Configuration

### Environment Variables
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
AI_CONFIDENCE_THRESHOLD=0.7
```

### AI Service Configuration
```typescript
{
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 500,
  timeout: 10000, // 10 seconds
  retries: 3
}
```

## Prompts

### Categorization Prompt Template
```
You are a financial categorization expert. Categorize the following transaction:

Description: {description}
Amount: {amount}
Merchant: {merchant}
Date: {date}

Available categories:
{categoriesList}

User's past categorization patterns:
{userPatterns}

Provide:
1. Category name
2. Confidence score (0-1)
3. Brief reasoning

Format: JSON
```

### Insights Prompt Template
```
Analyze the user's financial data and provide insights:

Period: {period}
Total Income: {totalIncome}
Total Expenses: {totalExpenses}
Spending by category: {categoryBreakdown}
Budget adherence: {budgetStatus}

Identify:
1. Overspending areas
2. Savings opportunities
3. Positive trends
4. Anomalies
5. Actionable recommendations

Provide 3-5 insights with severity levels.
```

## Rate Limiting
- **Categorization**: 100 requests/hour per user
- **Chat**: 50 messages/hour per user
- **Insights**: 20 requests/hour per user
- **Receipt Parsing**: 20 requests/hour per user

## Cost Management
- Categorization: ~$0.001 per request
- Chat: ~$0.002 per message
- Insights: ~$0.005 per request
- Receipt parsing: ~$0.01 per image

**Cost optimization:**
- Cache frequent categorizations
- Batch similar requests
- Use lower temperature for categorization
- Limit token usage

## Security
- API keys stored in environment variables
- User data anonymized in prompts
- No sensitive data sent to OpenAI
- All requests authenticated via JWT
- Rate limiting prevents abuse

## Error Handling
- **OpenAI API Errors**: Graceful fallback to rule-based categorization
- **Timeout**: 10-second timeout with retry logic
- **Invalid Response**: Parse errors handled with default values
- **Rate Limit**: Queue requests and retry later

## Performance
- **Average Response Time**:
  - Categorization: 1-2 seconds
  - Chat: 2-3 seconds
  - Insights: 3-5 seconds
  - Receipt parsing: 4-6 seconds
- **Caching**: Identical requests cached for 1 hour
- **Background Processing**: Insights generated async

## Testing
```bash
# Run AI module tests
npm run test -- ai

# Test with mock OpenAI responses
npm run test -- ai --mock

# Integration tests
npm run test:e2e -- ai
```

## Usage Examples

### Auto-Categorize Transaction
```typescript
const result = await fetch('/api/ai/categorize', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Netflix Subscription',
    amount: 15.99
  })
});

// { categoryName: 'Entertainment', confidence: 0.98 }
```

### Chat with AI
```typescript
const chat = await fetch('/api/ai/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'How can I save money on groceries?'
  })
});

// AI provides personalized suggestions based on user's data
```

### Get Financial Insights
```typescript
const insights = await fetch('/api/ai/insights', {
  method: 'POST',
  body: JSON.stringify({
    period: 'LAST_MONTH'
  })
});

// Returns array of insights with recommendations
```

## Best Practices
1. Always provide feedback on categorizations to improve accuracy
2. Use specific descriptions for better categorization
3. Review AI suggestions before accepting
4. Leverage insights weekly for financial awareness
5. Use chat for quick queries instead of manual searches
6. Parse receipts immediately after purchase for accuracy

## Related Modules
- **Transactions** - AI categorizes transactions
- **Categories** - AI suggests categories
- **Analytics** - AI generates insights from analytics data
- **Chat** - Dedicated chat module for AI conversations
- **Import** - AI helps categorize imported transactions

## Future Enhancements
- Support for GPT-4 for better accuracy
- Image-based expense tracking
- Voice input for transactions
- Predictive budgeting
- Anomaly detection for fraud
- Multi-language support
- Custom AI training per user
