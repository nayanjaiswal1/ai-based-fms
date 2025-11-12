# Account Reconciliation Feature

## Overview
This document describes the comprehensive Account Reconciliation feature implemented for the Finance Management System. This feature allows users to reconcile their account balances with bank statements by comparing and matching transactions automatically.

## Implementation Summary

### Backend Components

#### Entities Created
1. **Reconciliation Entity** (`/backend/src/database/entities/reconciliation.entity.ts`)
   - Tracks reconciliation sessions for accounts
   - Fields: accountId, userId, startDate, endDate, statementBalance, reconciledBalance, difference, status, completedAt, notes, matchedCount, unmatchedCount, statementTransactionCount, summary
   - Status enum: IN_PROGRESS, COMPLETED, CANCELLED

2. **ReconciliationTransaction Entity** (`/backend/src/database/entities/reconciliation-transaction.entity.ts`)
   - Maps statement transactions to account transactions
   - Fields: reconciliationId, transactionId, matched, matchConfidence, confidenceScore, statementAmount, statementDate, statementDescription, statementReferenceNumber, notes, isManualMatch, matchingDetails
   - Match confidence levels: EXACT (100%), HIGH (80-99%), MEDIUM (60-79%), LOW (<60%), MANUAL

3. **Account Entity Updates** (`/backend/src/database/entities/account.entity.ts`)
   - Added fields: reconciliationStatus (NONE, IN_PROGRESS, RECONCILED), lastReconciledAt, lastReconciledBalance

#### Services
4. **ReconciliationService** (`/backend/src/modules/reconciliation/reconciliation.service.ts`)
   - Core business logic for reconciliation workflow
   - **Intelligent Matching Algorithm:**
     - **Amount matching (40 points):** Exact match required (±$0.01)
     - **Date matching (30 points):**
       - Same date: 30 points
       - ±1 day: 25 points
       - ±2 days: 20 points
     - **Description similarity (30 points):**
       - Uses Levenshtein distance algorithm
       - >80% similarity: 30 points
       - >60% similarity: 25 points
       - >40% similarity: 20 points
       - >20% similarity: 15 points
     - **Minimum threshold:** 60% total score required for automatic matching
   - Key methods:
     - `startReconciliation()` - Initialize reconciliation
     - `uploadStatement()` - Process statement transactions and auto-match
     - `matchTransaction()` - Manual transaction matching
     - `unmatchTransaction()` - Remove match
     - `completeReconciliation()` - Finalize reconciliation
     - `cancelReconciliation()` - Cancel and restore account status
     - `adjustBalance()` - Add balance adjustments with reasons
     - `getReconciliationHistory()` - View past reconciliations

5. **ReconciliationController** (`/backend/src/modules/reconciliation/reconciliation.controller.ts`)
   - REST API endpoints:
     - `POST /reconciliations/start` - Start new reconciliation
     - `POST /reconciliations/:id/upload-statement` - Upload statement
     - `GET /reconciliations/:id` - Get reconciliation details
     - `POST /reconciliations/:id/match` - Match transaction manually
     - `POST /reconciliations/:id/unmatch` - Unmatch transaction
     - `POST /reconciliations/:id/complete` - Complete reconciliation
     - `DELETE /reconciliations/:id/cancel` - Cancel reconciliation
     - `GET /reconciliations/history/:accountId` - Get history
     - `POST /reconciliations/:id/adjust-balance` - Adjust balance

6. **DTOs Created** (`/backend/src/modules/reconciliation/dto/`)
   - `StartReconciliationDto` - Start reconciliation request
   - `UploadStatementDto` - Statement transactions upload
   - `MatchTransactionDto` - Manual match request
   - `UnmatchTransactionDto` - Unmatch request
   - `CompleteReconciliationDto` - Completion with notes/adjustments
   - `AdjustBalanceDto` - Balance adjustment request

7. **Database Migration** (`/backend/src/database/migrations/1699900000003-CreateReconciliationTables.ts`)
   - Creates `reconciliations` table
   - Creates `reconciliation_transactions` table
   - Adds reconciliation fields to `accounts` table
   - Creates necessary indexes and foreign keys

8. **Module Registration** (`/backend/src/app.module.ts`)
   - ReconciliationModule imported and registered

### Frontend Components

#### API Integration
1. **Reconciliation API Client** (`/frontend/src/features/reconciliation/api/reconciliation.api.ts`)
   - All API calls to reconciliation endpoints
   - TypeScript interfaces for type safety

2. **Custom Hooks** (`/frontend/src/features/reconciliation/hooks/useReconciliation.ts`)
   - `useReconciliation()` - Main hook for reconciliation operations
   - `useReconciliationHistory()` - Hook for viewing history
   - React Query integration for caching and optimistic updates
   - Toast notifications for user feedback

#### UI Components
3. **MatchCard Component** (`/frontend/src/features/reconciliation/components/MatchCard.tsx`)
   - Displays individual statement transaction
   - Shows match status with color-coded badges
   - Confidence score visualization
   - Manual matching dropdown for unmatched transactions
   - Unmatch functionality

4. **TransactionMatching Component** (`/frontend/src/features/reconciliation/components/TransactionMatching.tsx`)
   - Overview of matching progress
   - Statistics cards (Total, Matched, Unmatched)
   - Progress bar visualization
   - Separated views for matched and unmatched transactions
   - Batch operations support

5. **StatementUpload Component** (`/frontend/src/features/reconciliation/components/StatementUpload.tsx`)
   - Two upload methods:
     - CSV file upload with drag-and-drop
     - Manual transaction entry form
   - CSV parsing with flexible column mapping
   - Transaction preview table
   - Edit/delete transactions before upload

6. **ReconciliationSummary Component** (`/frontend/src/features/reconciliation/components/ReconciliationSummary.tsx`)
   - Balance comparison visualization
   - Difference highlighting (balanced vs. discrepancy)
   - Match rate statistics
   - Transaction summary cards
   - Date range display
   - Complete/Cancel action buttons

7. **ReconciliationHistory Component** (`/frontend/src/features/reconciliation/components/ReconciliationHistory.tsx`)
   - List of past reconciliations
   - Status badges (Completed, In Progress, Cancelled)
   - Balance information display
   - Quick view details button
   - Empty state handling

8. **ReconciliationWizard Component** (`/frontend/src/features/reconciliation/components/ReconciliationWizard.tsx`)
   - 4-step wizard interface:
     - Step 1: Start - Enter date range and statement balance
     - Step 2: Upload - Upload or enter statement transactions
     - Step 3: Match - Review and manually match transactions
     - Step 4: Complete - Review summary and finalize
   - Visual stepper with progress indication
   - Navigation between steps
   - Auto-save functionality
   - Cancel confirmation

9. **ReconciliationPage** (`/frontend/src/features/reconciliation/pages/ReconciliationPage.tsx`)
   - Main page wrapper
   - Route parameter handling
   - Account context management

#### Integration
10. **AccountsPage Updates** (`/frontend/src/features/accounts/pages/AccountsPage.tsx`)
    - Added reconciliation status badges (In Progress, Reconciled)
    - "Reconcile" button on each account card
    - Last reconciled date display
    - Navigation to reconciliation wizard

11. **Router Updates** (`/frontend/src/App.tsx`)
    - Added routes:
      - `/reconciliation` - New reconciliation
      - `/reconciliation/:reconciliationId` - View/continue reconciliation

## Key Features

### 1. Intelligent Automatic Matching
- Multi-factor matching algorithm combining amount, date, and description
- Confidence scoring system
- Configurable thresholds
- Handles date variations (bank processing delays)
- String similarity for description matching

### 2. Manual Override Capability
- Users can manually match/unmatch any transaction
- Override automatic matches
- Add notes to matches
- Track manual vs. automatic matches

### 3. Comprehensive Workflow
- Step-by-step wizard interface
- Progress visualization
- Auto-save functionality
- Cancel with confirmation
- Resume interrupted reconciliations

### 4. Balance Reconciliation
- Compare statement balance vs. reconciled balance
- Calculate and display differences
- Support for balance adjustments
- Track adjustment reasons

### 5. Historical Tracking
- Complete reconciliation history per account
- Status tracking (in progress, completed, cancelled)
- Audit trail for all reconciliations
- Summary statistics

### 6. Flexible Statement Upload
- CSV file import with flexible column mapping
- Manual transaction entry
- Preview before processing
- Edit/remove transactions

### 7. Data Integrity
- Database transactions for consistency
- Foreign key constraints
- Cascade deletes
- User ownership verification
- Status management

## Testing Recommendations

### Backend Testing

#### Unit Tests
```typescript
// ReconciliationService tests
describe('ReconciliationService', () => {
  describe('Matching Algorithm', () => {
    it('should match transactions with exact amount and date', () => {});
    it('should match transactions with date within 2 days', () => {});
    it('should calculate correct confidence scores', () => {});
    it('should not match below 60% threshold', () => {});
    it('should handle negative amounts correctly', () => {});
  });

  describe('Reconciliation Workflow', () => {
    it('should start reconciliation and update account status', () => {});
    it('should prevent multiple in-progress reconciliations', () => {});
    it('should upload and auto-match statement transactions', () => {});
    it('should complete reconciliation and update account', () => {});
    it('should cancel reconciliation and restore account status', () => {});
  });

  describe('Manual Matching', () => {
    it('should allow manual transaction matching', () => {});
    it('should allow unmatching transactions', () => {});
    it('should update match statistics', () => {});
  });
});
```

#### Integration Tests
```typescript
describe('Reconciliation API', () => {
  it('should complete full reconciliation workflow', async () => {
    // 1. Start reconciliation
    // 2. Upload statement
    // 3. Verify auto-matches
    // 4. Manual match remaining
    // 5. Complete reconciliation
    // 6. Verify account status update
  });

  it('should handle reconciliation with discrepancies', async () => {});
  it('should prevent unauthorized access', async () => {});
  it('should handle concurrent reconciliation attempts', async () => {});
});
```

#### Edge Cases to Test
1. **Empty statements** - No transactions uploaded
2. **All unmatched** - No automatic matches found
3. **Duplicate amounts** - Multiple transactions with same amount
4. **Date variations** - Transactions with 0, 1, 2+ day differences
5. **Special characters** - Descriptions with unicode, symbols
6. **Large datasets** - 1000+ statement transactions
7. **Concurrent updates** - Multiple users, race conditions
8. **Negative amounts** - Credits vs. debits
9. **Balance adjustments** - Adding adjustments with reasons
10. **Cancellation** - Mid-workflow cancellation

### Frontend Testing

#### Component Tests
```typescript
describe('ReconciliationWizard', () => {
  it('should render all steps', () => {});
  it('should validate required fields', () => {});
  it('should progress through steps', () => {});
  it('should handle errors gracefully', () => {});
});

describe('TransactionMatching', () => {
  it('should display matched and unmatched sections', () => {});
  it('should calculate match rate correctly', () => {});
  it('should allow manual matching', () => {});
});

describe('StatementUpload', () => {
  it('should parse CSV files correctly', () => {});
  it('should validate manual entry', () => {});
  it('should preview transactions', () => {});
});
```

#### E2E Tests
```typescript
describe('Account Reconciliation E2E', () => {
  it('should complete full reconciliation flow', () => {
    // 1. Navigate to accounts
    // 2. Click reconcile button
    // 3. Enter reconciliation details
    // 4. Upload CSV statement
    // 5. Review auto-matches
    // 6. Manually match unmatched
    // 7. Complete reconciliation
    // 8. Verify status update
  });
});
```

### Manual Testing Checklist

#### Basic Workflow
- [ ] Start new reconciliation
- [ ] Upload CSV statement
- [ ] Verify auto-matching works
- [ ] Manually match unmatched transactions
- [ ] Complete reconciliation
- [ ] View reconciliation history
- [ ] Cancel reconciliation mid-workflow

#### CSV Upload
- [ ] Upload valid CSV file
- [ ] Upload CSV with different column orders
- [ ] Upload CSV with missing columns
- [ ] Upload invalid file format
- [ ] Upload very large file (1000+ rows)

#### Matching
- [ ] Verify exact matches (100% confidence)
- [ ] Verify high confidence matches (80-99%)
- [ ] Verify medium confidence matches (60-79%)
- [ ] Verify no matches below 60%
- [ ] Test date variations (same day, ±1, ±2 days)
- [ ] Test description similarity
- [ ] Manual override of auto-match
- [ ] Unmatch and rematch transactions

#### Edge Cases
- [ ] Reconcile with 0 transactions
- [ ] Reconcile with all matched
- [ ] Reconcile with all unmatched
- [ ] Multiple reconciliations on same account
- [ ] Reconciliation with negative balance
- [ ] Reconciliation with very large amounts
- [ ] Special characters in descriptions

#### UI/UX
- [ ] Responsive design on mobile
- [ ] Stepper navigation works correctly
- [ ] Progress bar updates
- [ ] Status badges display correctly
- [ ] Error messages are clear
- [ ] Success notifications appear
- [ ] Loading states work

#### Permissions
- [ ] Cannot access other users' reconciliations
- [ ] Cannot reconcile other users' accounts
- [ ] Proper error handling for unauthorized access

## Database Schema

### reconciliations
```sql
id                        UUID PRIMARY KEY
accountId                 UUID FOREIGN KEY → accounts.id
userId                    UUID FOREIGN KEY → users.id
startDate                 DATE
endDate                   DATE
statementBalance          DECIMAL(15,2)
reconciledBalance         DECIMAL(15,2)
difference                DECIMAL(15,2)
status                    ENUM(in_progress, completed, cancelled)
completedAt               TIMESTAMP
notes                     TEXT
matchedCount              INT
unmatchedCount            INT
statementTransactionCount INT
summary                   JSONB
createdAt                 TIMESTAMP
updatedAt                 TIMESTAMP
```

### reconciliation_transactions
```sql
id                      UUID PRIMARY KEY
reconciliationId        UUID FOREIGN KEY → reconciliations.id
transactionId           UUID FOREIGN KEY → transactions.id
matched                 BOOLEAN
matchConfidence         ENUM(exact, high, medium, low, manual)
confidenceScore         DECIMAL(5,2)
statementAmount         DECIMAL(15,2)
statementDate           DATE
statementDescription    VARCHAR
statementReferenceNumber VARCHAR
notes                   TEXT
isManualMatch           BOOLEAN
matchingDetails         JSONB
createdAt               TIMESTAMP
```

### accounts (updated fields)
```sql
reconciliationStatus    ENUM(none, in_progress, reconciled)
lastReconciledAt        TIMESTAMP
lastReconciledBalance   DECIMAL(15,2)
```

## API Endpoints

All endpoints require authentication (JWT token).

### POST /reconciliations/start
Start a new reconciliation for an account.

**Request:**
```json
{
  "accountId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "statementBalance": 5000.00,
  "notes": "January reconciliation"
}
```

**Response:**
```json
{
  "id": "uuid",
  "accountId": "uuid",
  "userId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "statementBalance": 5000.00,
  "status": "in_progress",
  "matchedCount": 0,
  "unmatchedCount": 0,
  "statementTransactionCount": 0,
  "createdAt": "2024-01-31T10:00:00Z"
}
```

### POST /reconciliations/:id/upload-statement
Upload statement transactions and perform automatic matching.

**Request:**
```json
{
  "transactions": [
    {
      "amount": -50.00,
      "date": "2024-01-15",
      "description": "AMAZON.COM",
      "referenceNumber": "ABC123"
    }
  ]
}
```

**Response:** Returns updated reconciliation with matched transactions.

### POST /reconciliations/:id/match
Manually match a statement transaction to an account transaction.

**Request:**
```json
{
  "reconciliationTransactionId": "uuid",
  "transactionId": "uuid",
  "isManual": true,
  "notes": "Manual match"
}
```

### POST /reconciliations/:id/complete
Complete the reconciliation.

**Request:**
```json
{
  "notes": "Completed successfully",
  "adjustments": [
    {
      "type": "bank_fee",
      "amount": 5.00,
      "reason": "Monthly maintenance fee"
    }
  ]
}
```

### GET /reconciliations/history/:accountId
Get reconciliation history for an account.

**Response:**
```json
[
  {
    "id": "uuid",
    "accountId": "uuid",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "statementBalance": 5000.00,
    "reconciledBalance": 5000.00,
    "difference": 0.00,
    "status": "completed",
    "completedAt": "2024-01-31T15:00:00Z",
    "matchedCount": 25,
    "unmatchedCount": 0
  }
]
```

## Future Enhancements

### High Priority
1. **Bulk Operations** - Match/unmatch multiple transactions at once
2. **Smart Suggestions** - ML-based matching suggestions
3. **Statement Templates** - Save CSV column mappings for reuse
4. **Scheduled Reconciliations** - Automatic reminders
5. **Export Reports** - PDF/CSV reconciliation reports

### Medium Priority
6. **Bank API Integration** - Direct statement download
7. **Multi-Currency Support** - Handle currency conversions
8. **Advanced Filtering** - Filter by date range, amount, description
9. **Reconciliation Notes** - Add notes to specific matches
10. **Approval Workflow** - Multi-user approval for reconciliations

### Low Priority
11. **Mobile App** - Native mobile reconciliation
12. **Batch Import** - Import multiple statements at once
13. **AI Description Matching** - Use AI for better description matching
14. **Reconciliation Analytics** - Trends and insights
15. **Custom Rules** - User-defined matching rules

## Performance Considerations

1. **Indexing** - All foreign keys and frequently queried fields are indexed
2. **Query Optimization** - Use joins instead of multiple queries
3. **Pagination** - Implement pagination for large statement uploads
4. **Caching** - Cache reconciliation details on frontend
5. **Batch Processing** - Process large statements in chunks
6. **Background Jobs** - Move heavy matching to background queue for large datasets

## Security Considerations

1. **User Ownership** - All queries verify user ownership
2. **Input Validation** - All DTOs have validation rules
3. **SQL Injection** - TypeORM prevents SQL injection
4. **Authorization** - JWT authentication on all endpoints
5. **Rate Limiting** - Prevent abuse of upload endpoint
6. **File Size Limits** - Limit CSV file size
7. **Data Sanitization** - Clean CSV data before processing

## Monitoring and Logging

### Key Metrics to Track
1. Average reconciliation completion time
2. Match rate (automatic vs. manual)
3. Number of active reconciliations
4. Failed reconciliation attempts
5. CSV parsing errors
6. API endpoint response times

### Logging Points
- Reconciliation started/completed/cancelled
- Statement upload
- Matching algorithm execution time
- Manual match operations
- Balance adjustments
- Errors and exceptions

## Conclusion

The Account Reconciliation feature is a comprehensive solution for matching account transactions with bank statements. It includes intelligent automatic matching, manual override capabilities, a user-friendly wizard interface, and complete audit tracking. The implementation follows best practices for security, performance, and maintainability.
