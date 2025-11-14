# Testing Checklist: Database Optimization & Transaction Navigation

## Pre-Deployment Testing

### 1. Database Migration Tests

- [ ] **Run Migrations Successfully**
  ```bash
  cd backend
  npm run migration:run
  ```
  Expected: Both migrations complete without errors

- [ ] **Verify Schema Changes**
  ```sql
  -- Check computed columns are removed
  \d investments;     -- No 'returns', 'returnPercentage'
  \d lend_borrow;     -- No 'amountRemaining'
  \d budgets;         -- No 'spent'

  -- Check new tables exist
  \dt shared_expense*
  \dt transaction_line_items
  ```

- [ ] **Verify Data Migration**
  ```sql
  -- Count migrated records
  SELECT COUNT(*) FROM shared_expense_groups WHERE "isOneToOne" = true;  -- Should = lend_borrow count
  SELECT COUNT(*) FROM shared_expense_groups WHERE "isOneToOne" = false; -- Should = groups count

  -- Verify balances preserved
  SELECT "otherPersonName", "debtDirection",
         (SELECT balance FROM shared_expense_participants WHERE "groupId" = g.id AND "userId" IS NOT NULL)
  FROM shared_expense_groups g
  WHERE "isOneToOne" = true
  LIMIT 5;
  ```

### 2. Backend API Tests

#### SharedExpenses Endpoints

- [ ] **GET /shared-expenses (All)**
  ```bash
  curl http://localhost:3000/api/shared-expenses
  ```
  Expected: Returns array of all expenses

- [ ] **GET /shared-expenses?isOneToOne=true (Personal Debts)**
  ```bash
  curl http://localhost:3000/api/shared-expenses?isOneToOne=true
  ```
  Expected: Returns only 1-to-1 debts

- [ ] **GET /shared-expenses?isOneToOne=false (Groups)**
  ```bash
  curl http://localhost:3000/api/shared-expenses?isOneToOne=false
  ```
  Expected: Returns only groups

- [ ] **POST /shared-expenses/personal-debt (Create)**
  ```bash
  curl -X POST http://localhost:3000/api/shared-expenses/personal-debt \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{
      "description": "Test Loan",
      "amount": 100,
      "date": "2025-11-14",
      "otherPersonName": "Test User",
      "otherPersonEmail": "test@example.com",
      "debtDirection": "lend"
    }'
  ```
  Expected: 201 Created, returns new debt

- [ ] **POST (Duplicate Detection)**
  ```bash
  # Create second debt to same person
  curl -X POST http://localhost:3000/api/shared-expenses/personal-debt \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{
      "description": "Another Loan",
      "amount": 50,
      "date": "2025-11-14",
      "otherPersonName": "Test User",
      "otherPersonEmail": "test@example.com",
      "debtDirection": "lend"
    }'
  ```
  Expected: Returns existing group with updated balance ($150 total)

- [ ] **GET /shared-expenses/consolidated-debts**
  ```bash
  curl http://localhost:3000/api/shared-expenses/consolidated-debts \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```
  Expected: Returns debts grouped by person

- [ ] **GET /shared-expenses/:id**
  ```bash
  curl http://localhost:3000/api/shared-expenses/{GROUP_ID} \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```
  Expected: Returns detailed group info with participants and transactions

#### Transaction Source Tracking

- [ ] **POST /transactions (with line items)**
  ```bash
  curl -X POST http://localhost:3000/api/transactions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{
      "description": "Grocery Shopping",
      "type": "expense",
      "date": "2025-11-14",
      "accountId": "ACCOUNT_ID",
      "lineItems": [
        {"categoryId": "FOOD_CAT_ID", "description": "Vegetables", "amount": 20},
        {"categoryId": "HOUSEHOLD_CAT_ID", "description": "Cleaning", "amount": 15},
        {"categoryId": "PERSONAL_CAT_ID", "description": "Toiletries", "amount": 10}
      ]
    }'
  ```
  Expected: Creates transaction with 3 line items, total = $45

- [ ] **GET /transactions/:id/source**
  ```bash
  curl http://localhost:3000/api/transactions/{TRANSACTION_ID}/source \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```
  Expected: Returns source info or manual

- [ ] **GET /transactions (with line items)**
  ```bash
  curl http://localhost:3000/api/transactions \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```
  Expected: Includes `lineItems` and `sourceType` fields

### 3. Frontend UI Tests

#### SharedExpenses Page

- [ ] **Navigate to /shared-expenses**
  - Page loads without errors
  - Tabs visible: All, Personal Debts, Groups

- [ ] **Tab: All**
  - Shows both 1-to-1 debts and groups
  - Mixed display styles

- [ ] **Tab: Personal Debts**
  - Shows only 1-to-1 debts
  - Display format: "John Doe" | "Owes you $100"
  - Green icon for lend, red for borrow

- [ ] **Tab: Groups**
  - Shows only groups
  - Display format: "Trip to Bali" | "5 people"
  - Blue icon

- [ ] **Click on 1-to-1 Debt**
  - Navigates to detail page
  - Shows person name, balance, transaction history

- [ ] **Click on Group**
  - Navigates to group detail page
  - Shows members, balances, transactions

#### Transaction Navigation

- [ ] **Transaction List Displays Indicators**
  - 🔗 icon shows for transactions with sources
  - "X items" badge shows for multi-item transactions
  - Hover shows tooltips

- [ ] **Click Transaction with Source**
  - Navigates to source page
  - For investment: → `/investments/:id`
  - For shared expense: → `/shared-expenses/:id`

- [ ] **Click Transaction without Source**
  - Opens transaction detail modal
  - Shows full transaction details

#### Multi-Item Transaction Form

- [ ] **Create Multi-Item Transaction**
  1. Click "New Transaction"
  2. Toggle "Multiple Items"
  3. Add 3 items with different categories
  4. Verify total updates automatically
  5. Submit form
  6. Verify transaction saved with line items

- [ ] **Display Multi-Item Transaction**
  - Transaction list shows "3 items" badge
  - Click transaction to view details
  - Line items shown in expandable section
  - Each item shows: category, description, amount

### 4. Integration Tests

#### Duplicate Prevention Flow

- [ ] **Create First Debt**
  - POST personal debt to "Jane Doe"
  - Verify creates new group

- [ ] **Create Second Debt (Same Person)**
  - POST another debt to "Jane Doe"
  - Verify adds to existing group (not new)
  - Verify balance updated correctly

- [ ] **Create Third Debt (Different Email)**
  - POST debt to "Jane Doe" with different email
  - Verify creates separate group
  - Verify both groups show in list

#### Transaction Source Flow

- [ ] **Create Investment**
  - Create investment via POST /investments
  - Verify transaction created with sourceType='investment'
  - Click transaction in list
  - Verify navigates back to investment detail

- [ ] **Create Shared Expense Transaction**
  - Create shared expense transaction
  - Verify transaction has sourceType='shared_expense'
  - Click transaction
  - Verify navigates to shared expense group

#### Balance Calculations

- [ ] **Lend Money**
  - Create lend transaction $100
  - Verify user balance = +$100 (owed to user)
  - Verify other person balance = -$100 (owes)

- [ ] **Borrow Money**
  - Create borrow transaction $50
  - Verify user balance = -$50 (user owes)
  - Verify other person balance = +$50 (owed to other)

- [ ] **Record Payment**
  - Record $30 payment on $100 debt
  - Verify user balance = +$70
  - Verify transaction history shows payment

### 5. Performance Tests

- [ ] **Query Performance**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM shared_expense_groups WHERE "isOneToOne" = true;
  ```
  Expected: Index scan, < 10ms

- [ ] **Transaction Source Query**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM transactions WHERE "sourceType" = 'investment';
  ```
  Expected: Index scan on [sourceType, sourceId]

- [ ] **Large Dataset**
  - Create 1000 transactions with line items
  - Verify list loads in < 2 seconds
  - Verify pagination works

### 6. Edge Cases

- [ ] **Empty States**
  - No debts: Shows "No expenses found"
  - No line items: Shows single category
  - No source: Shows manual icon

- [ ] **Error Handling**
  - Invalid debt amount: Shows validation error
  - Duplicate with network error: Retries gracefully
  - Failed navigation: Fallback to modal

- [ ] **Data Integrity**
  - Delete source (investment): Transaction remains
  - Delete participant: Balance recalculates
  - Merge transactions: Line items preserved

### 7. Backward Compatibility

- [ ] **Old Endpoints Still Work**
  ```bash
  # Legacy lend-borrow endpoints
  curl http://localhost:3000/api/lend-borrow

  # Legacy groups endpoints
  curl http://localhost:3000/api/groups
  ```
  Expected: Still functional (deprecated but working)

- [ ] **Existing Transactions**
  - Old transactions without sourceType: Display correctly
  - Old transactions without lineItems: Display correctly

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error logs for exceptions
- [ ] Check database query performance
- [ ] Verify migration completed successfully
- [ ] Monitor API response times
- [ ] Check WebSocket connections

### First Week

- [ ] Verify no data loss
- [ ] Monitor user feedback
- [ ] Check duplicate detection accuracy
- [ ] Verify balance calculations correct
- [ ] Performance benchmarks met

## Rollback Triggers

Rollback if any of these occur:

- ❌ Data loss detected
- ❌ Migration fails mid-way
- ❌ Performance degrades >20%
- ❌ Critical bugs in production
- ❌ API errors >5% rate

## Sign-Off

- [ ] All backend tests passing
- [ ] All frontend tests passing
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Edge cases handled
- [ ] Documentation complete
- [ ] Deployment guide reviewed
- [ ] Rollback plan tested

---

**Tested By:** _________________
**Date:** _________________
**Build Version:** _________________
**Status:** ☐ Pass ☐ Fail ☐ Needs Review

## Notes

_Add any additional notes or observations here_
