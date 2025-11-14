# Transactions Module

## Overview
The Transactions module is the core of the Finance Management System, handling all financial transactions including income, expenses, transfers, and group transactions.

## Features
- Create, read, update, and delete transactions
- Support multiple transaction types
- Advanced filtering and search
- Bulk operations (delete, categorize, merge)
- Duplicate detection using Levenshtein algorithm
- Transaction merging
- Attachment support
- Auto-categorization with AI
- Real-time balance updates

## Module Structure

```
transactions/
├── transactions.module.ts          # Module definition
├── transactions.controller.ts      # REST API endpoints
├── transactions.service.ts         # Business logic
├── dto/                            # Data Transfer Objects
│   ├── create-transaction.dto.ts   # Transaction creation validation
│   ├── update-transaction.dto.ts   # Transaction update validation
│   ├── filter-transaction.dto.ts   # Filter/search parameters
│   └── bulk-operations.dto.ts      # Bulk operation requests
└── README.md                       # This file
```

## Transaction Types
- **INCOME** - Money received
- **EXPENSE** - Money spent
- **TRANSFER** - Money moved between accounts
- **LEND** - Money lent to someone
- **BORROW** - Money borrowed from someone
- **GROUP** - Group expense transactions

## Transaction Sources
- **MANUAL** - User-created
- **EMAIL** - Extracted from email
- **FILE_IMPORT** - Imported from CSV/Excel/PDF
- **API** - Created via API integration
- **CHAT** - Created via AI chat

## API Endpoints

### GET /api/transactions
Get all transactions with advanced filtering.

**Query Parameters:**
- `type` - Filter by transaction type
- `categoryId` - Filter by category
- `accountId` - Filter by account
- `startDate` - Date range start
- `endDate` - Date range end
- `minAmount` - Minimum amount
- `maxAmount` - Maximum amount
- `search` - Search in description/notes
- `tags` - Filter by tags (comma-separated)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)
- `sortBy` - Sort field (default: date)
- `sortOrder` - Sort order (ASC/DESC, default: DESC)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "EXPENSE",
      "amount": 50.00,
      "description": "Grocery shopping",
      "date": "2025-01-15",
      "category": {
        "id": "uuid",
        "name": "Food & Dining"
      },
      "account": {
        "id": "uuid",
        "name": "Main Bank"
      },
      "tags": ["groceries", "weekly"],
      "source": "MANUAL"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "lastPage": 3
  }
}
```

### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "type": "EXPENSE",
  "amount": 75.50,
  "description": "Restaurant dinner",
  "date": "2025-01-15",
  "categoryId": "uuid",
  "accountId": "uuid",
  "tags": ["dining"],
  "notes": "Dinner with friends"
}
```

### GET /api/transactions/:id
Get transaction details.

### PATCH /api/transactions/:id
Update a transaction.

### DELETE /api/transactions/:id
Delete a transaction.

### POST /api/transactions/bulk-delete
Delete multiple transactions.

**Request Body:**
```json
{
  "transactionIds": ["uuid1", "uuid2", "uuid3"]
}
```

### POST /api/transactions/bulk-categorize
Categorize multiple transactions.

**Request Body:**
```json
{
  "transactionIds": ["uuid1", "uuid2"],
  "categoryId": "uuid"
}
```

### GET /api/transactions/duplicates
Find potential duplicate transactions.

**Query Parameters:**
- `threshold` - Similarity threshold (0-1, default: 0.85)
- `days` - Look back period in days (default: 30)

**Response:**
```json
[
  {
    "original": { /* transaction */ },
    "duplicates": [
      {
        "transaction": { /* transaction */ },
        "similarity": 0.92
      }
    ]
  }
]
```

### POST /api/transactions/merge
Merge duplicate transactions.

**Request Body:**
```json
{
  "primaryId": "uuid",
  "duplicateIds": ["uuid1", "uuid2"]
}
```

### GET /api/transactions/stats
Get transaction statistics.

**Query Parameters:**
- `startDate` - Period start
- `endDate` - Period end

**Response:**
```json
{
  "totalIncome": 5000.00,
  "totalExpense": 3500.00,
  "netIncome": 1500.00,
  "transactionCount": 150,
  "averageExpense": 23.33,
  "topCategories": [
    {
      "categoryId": "uuid",
      "categoryName": "Food",
      "total": 800.00,
      "count": 45
    }
  ]
}
```

## Database Entity

**Table:** `transactions`

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → users.id)
- `type` (ENUM)
- `amount` (DECIMAL)
- `description` (VARCHAR)
- `date` (DATE)
- `categoryId` (UUID, Foreign Key → categories.id, nullable)
- `accountId` (UUID, Foreign Key → accounts.id)
- `destinationAccountId` (UUID, Foreign Key → accounts.id, nullable)
- `source` (ENUM, default: 'MANUAL')
- `notes` (TEXT, nullable)
- `attachmentUrl` (VARCHAR, nullable)
- `isReconciled` (BOOLEAN, default: false)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Relationships:**
- Many-to-One with User
- Many-to-One with Category
- Many-to-One with Account (sourceAccount)
- Many-to-One with Account (destinationAccount, for transfers)
- Many-to-Many with Tag (through transaction_tags join table)

## Business Logic

### Balance Updates
When a transaction is created/updated/deleted:
1. Update source account balance
2. For transfers, update destination account balance
3. Recalculate budget progress if categorized
4. Update net worth calculation
5. Trigger WebSocket notification

### Duplicate Detection Algorithm
Uses Levenshtein distance algorithm to compare:
- Transaction description (60% weight)
- Amount (30% weight)
- Date proximity (10% weight)

Similarity score > 0.85 flags as potential duplicate.

### Transaction Merging
When merging duplicates:
1. Keep all data from primary transaction
2. Merge tags from duplicates
3. Combine notes
4. Soft delete duplicate transactions
5. Update references in other entities

### Auto-Categorization
If no category specified:
1. Check user's categorization rules
2. Use AI service for suggestion
3. Learn from user's corrections

## Validation Rules
- Amount must be > 0
- Description required (3-200 characters)
- Date cannot be in the future (unless it's planned)
- For TRANSFER type, destinationAccountId is required
- Source and destination accounts must be different
- Account must belong to the user
- Category must belong to the user (if specified)

## Security
- Users can only access their own transactions
- JWT authentication required
- Role-based access for bulk operations
- Rate limiting: 100 requests/minute

## Filtering & Search

### Advanced Filters
```typescript
GET /api/transactions?type=EXPENSE&categoryId=uuid&startDate=2025-01-01&endDate=2025-01-31&minAmount=10&maxAmount=100&tags=food,dining&search=restaurant
```

### Pagination
```typescript
GET /api/transactions?page=2&limit=50
```

### Sorting
```typescript
GET /api/transactions?sortBy=amount&sortOrder=DESC
```

## Performance Optimizations
- Database indexes on:
  - userId, date (composite)
  - categoryId
  - accountId
  - type
  - createdAt
- Query result caching (Redis, TTL: 300s)
- Pagination to limit result sets
- Lazy loading for relationships

## Related Modules
- **Accounts** - Every transaction affects account balances
- **Categories** - Transactions are categorized
- **Tags** - Transactions can have multiple tags
- **Budgets** - Transaction spending affects budgets
- **Analytics** - Transactions are the data source
- **AI** - Auto-categorization and insights
- **Import** - Bulk transaction creation
- **Export** - Transaction data export
- **Groups** - Group expense transactions

## Error Handling
- `404 NOT_FOUND` - Transaction not found
- `403 FORBIDDEN` - User doesn't own the transaction
- `400 BAD_REQUEST` - Invalid transaction data
- `409 CONFLICT` - Cannot delete reconciled transaction

## WebSocket Events
- `transaction.created` - New transaction added
- `transaction.updated` - Transaction modified
- `transaction.deleted` - Transaction removed
- `balance.updated` - Account balance changed

## Testing
```bash
# Run transaction tests
npm run test -- transactions

# Run with coverage
npm run test:cov -- transactions
```

## Usage Examples

### Create an Expense
```typescript
POST /api/transactions
{
  "type": "EXPENSE",
  "amount": 120.00,
  "description": "Electric bill",
  "date": "2025-01-15",
  "categoryId": "utilities-category-id",
  "accountId": "bank-account-id",
  "tags": ["bills", "utilities"]
}
```

### Create a Transfer
```typescript
POST /api/transactions
{
  "type": "TRANSFER",
  "amount": 500.00,
  "description": "Transfer to savings",
  "date": "2025-01-15",
  "accountId": "checking-account-id",
  "destinationAccountId": "savings-account-id"
}
```

### Find Duplicates and Merge
```typescript
// 1. Find duplicates
GET /api/transactions/duplicates?threshold=0.9&days=30

// 2. Merge them
POST /api/transactions/merge
{
  "primaryId": "keep-this-one",
  "duplicateIds": ["duplicate1", "duplicate2"]
}
```

## Best Practices
1. Always specify a category for better insights
2. Use tags for flexible grouping
3. Add notes for important context
4. Reconcile transactions regularly
5. Use bulk operations for better performance
6. Enable AI categorization for time savings
