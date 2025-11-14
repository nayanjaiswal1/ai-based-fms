# Accounts Module

## Overview
The Accounts module manages financial accounts (bank accounts, wallets, cash, credit cards, investment accounts) for users in the Finance Management System.

## Features
- Create, read, update, and delete financial accounts
- Track account balances in real-time
- Support multiple account types
- Balance history tracking
- Account summary and statistics

## Module Structure

```
accounts/
├── accounts.module.ts          # Module definition
├── accounts.controller.ts      # REST API endpoints
├── accounts.service.ts         # Business logic
├── dto/                        # Data Transfer Objects
│   ├── create-account.dto.ts   # Account creation validation
│   └── update-account.dto.ts   # Account update validation
└── README.md                   # This file
```

## Account Types
- **BANK** - Bank accounts
- **WALLET** - Digital wallets
- **CASH** - Physical cash
- **CREDIT_CARD** - Credit card accounts
- **INVESTMENT** - Investment accounts

## API Endpoints

### GET /api/accounts
Get all accounts for the authenticated user.

**Query Parameters:**
- `type` (optional) - Filter by account type
- `isActive` (optional) - Filter by active status

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Main Bank Account",
    "type": "BANK",
    "balance": 5000.00,
    "currency": "USD",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/accounts
Create a new account.

**Request Body:**
```json
{
  "name": "Savings Account",
  "type": "BANK",
  "balance": 1000.00,
  "currency": "USD",
  "description": "Personal savings"
}
```

### GET /api/accounts/:id
Get details of a specific account.

### PATCH /api/accounts/:id
Update account details.

**Request Body:**
```json
{
  "name": "Updated Account Name",
  "description": "Updated description"
}
```

### DELETE /api/accounts/:id
Delete an account (soft delete if transactions exist).

### GET /api/accounts/:id/balance-history
Get balance history for an account.

**Query Parameters:**
- `startDate` - Start date for history
- `endDate` - End date for history

### GET /api/accounts/summary
Get summary statistics for all accounts.

**Response:**
```json
{
  "totalAccounts": 5,
  "totalBalance": 15000.00,
  "accountsByType": {
    "BANK": 2,
    "WALLET": 1,
    "CASH": 2
  }
}
```

## Database Entity

**Table:** `accounts`

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → users.id)
- `name` (VARCHAR)
- `type` (ENUM)
- `balance` (DECIMAL)
- `currency` (VARCHAR, default: 'USD')
- `description` (TEXT, nullable)
- `isActive` (BOOLEAN, default: true)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Relationships:**
- Many-to-One with User
- One-to-Many with Transaction (as sourceAccount or destinationAccount)

## Business Logic

### Balance Management
- Balance is automatically updated when transactions are created/updated/deleted
- Transfers between accounts update both account balances atomically
- Balance cannot go negative unless account type is CREDIT_CARD

### Account Deletion
- Soft delete if account has transaction history
- Hard delete only if no transactions exist
- Associated transactions are preserved with account reference

## Validation Rules
- Account name is required (3-100 characters)
- Account type must be valid enum value
- Initial balance must be >= 0 (except CREDIT_CARD)
- Currency must be valid ISO 4217 code (default: USD)
- User can have maximum 50 accounts

## Security
- Users can only access their own accounts
- JWT authentication required for all endpoints
- Role-based access control enforced

## Usage Examples

### Creating a Bank Account
```typescript
POST /api/accounts
{
  "name": "Chase Checking",
  "type": "BANK",
  "balance": 2500.00,
  "currency": "USD"
}
```

### Getting Account Balance History
```typescript
GET /api/accounts/123e4567-e89b-12d3-a456-426614174000/balance-history?startDate=2025-01-01&endDate=2025-12-31
```

## Related Modules
- **Transactions** - All transactions reference accounts
- **Analytics** - Account data used in financial analytics
- **Budgets** - Budgets can be tied to specific accounts
- **Import** - Imported transactions create/update accounts

## Error Handling
- `404 NOT_FOUND` - Account not found
- `403 FORBIDDEN` - User doesn't own the account
- `400 BAD_REQUEST` - Invalid account data
- `409 CONFLICT` - Cannot delete account with transactions

## Testing
Run tests with:
```bash
npm run test -- accounts
```

## Performance Considerations
- Account queries are indexed by userId
- Balance calculations are cached with Redis (TTL: 3600s)
- Pagination implemented for large result sets
