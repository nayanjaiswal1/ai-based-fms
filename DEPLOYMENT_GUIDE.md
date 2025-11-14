# Deployment Guide: Database Optimization & Transaction Navigation

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ running
- Redis running (for caching)

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 2: Configure Environment

**Backend `.env`:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fms_user
DATABASE_PASSWORD=fms_password
DATABASE_NAME=fms_db

JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

REDIS_HOST=localhost
REDIS_PORT=6379

# Optional: For AI features
OPENAI_API_KEY=sk-...
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## Step 3: Run Migrations

```bash
cd backend

# Run all migrations
npm run migration:run

# Verify migrations
npm run migration:show
```

**Expected Migrations:**
1. ✅ `OptimizeSchemaAndAddSharedExpenses` - Schema changes
2. ✅ `MigrateLendBorrowAndGroups` - Data migration

## Step 4: Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 5: Verify Implementation

### Backend Tests

```bash
# 1. Check if SharedExpenses module is loaded
curl http://localhost:3000/api/shared-expenses

# 2. Check transaction source tracking
curl http://localhost:3000/api/transactions/:id/source

# 3. Create a test personal debt
curl -X POST http://localhost:3000/api/shared-expenses/personal-debt \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Lunch",
    "amount": 50,
    "date": "2025-11-14",
    "otherPersonName": "John Doe",
    "otherPersonEmail": "john@example.com",
    "debtDirection": "lend"
  }'

# 4. Test duplicate detection (should merge into existing)
curl -X POST http://localhost:3000/api/shared-expenses/personal-debt \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dinner",
    "amount": 30,
    "date": "2025-11-14",
    "otherPersonName": "John Doe",
    "otherPersonEmail": "john@example.com",
    "debtDirection": "lend"
  }'

# 5. Get consolidated debts
curl http://localhost:3000/api/shared-expenses/consolidated-debts
```

### Frontend Tests

1. **Navigate to Shared Expenses:**
   - Go to `/shared-expenses`
   - Should see list with tabs: All, Personal Debts, Groups

2. **Test Smart Display:**
   - Personal debt shows: "John Doe" with "Owes you $50"
   - Groups show: "Trip Name" with "X people"

3. **Test Transaction Navigation:**
   - Go to `/transactions`
   - Click on transaction with 🔗 icon
   - Should navigate to source (investment/shared-expense/etc.)

4. **Test Multi-Item Transactions:**
   - Create new transaction
   - Enable multi-item mode
   - Add multiple items with different categories
   - Verify total calculation

## Step 6: Data Verification

```sql
-- Connect to database
psql -U fms_user -d fms_db

-- Check migrated data
SELECT COUNT(*) FROM shared_expense_groups WHERE "isOneToOne" = true;
SELECT COUNT(*) FROM shared_expense_groups WHERE "isOneToOne" = false;
SELECT COUNT(*) FROM shared_expense_participants;
SELECT COUNT(*) FROM shared_expense_transactions;

-- Check transaction line items
SELECT COUNT(*) FROM transaction_line_items;

-- Verify computed columns are removed
\d investments;     -- Should NOT have 'returns' or 'returnPercentage'
\d lend_borrow;     -- Should NOT have 'amountRemaining'
\d budgets;         -- Should NOT have 'spent'

-- Verify source tracking
SELECT "sourceType", COUNT(*)
FROM transactions
GROUP BY "sourceType";
```

## Rollback Plan

If issues occur:

```bash
# Revert migrations
cd backend
npm run migration:revert  # Reverts MigrateLendBorrowAndGroups
npm run migration:revert  # Reverts OptimizeSchemaAndAddSharedExpenses

# Check status
npm run migration:show
```

## Common Issues & Solutions

### Issue 1: Migration fails
**Solution:**
```bash
# Check if tables exist
psql -U fms_user -d fms_db -c "\dt"

# If tables already exist, skip failed migration
# Then fix and re-run
```

### Issue 2: Computed columns referenced in code
**Solution:**
```typescript
// OLD (database column):
investment.returns

// NEW (computed):
investment.currentValue - investment.investedAmount

// OLD:
budget.spent

// NEW (query):
await transactionRepository
  .createQueryBuilder('t')
  .select('SUM(t.amount)', 'spent')
  .where('t.budgetId = :budgetId', { budgetId })
  .getRawOne();
```

### Issue 3: Cannot find module errors
**Solution:**
```bash
# Re-install dependencies
rm -rf node_modules package-lock.json
npm install
```

## Performance Monitoring

After deployment, monitor:

1. **Query Performance:**
   ```sql
   -- Check slow queries
   SELECT query, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Storage:**
   ```sql
   -- Check table sizes
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Index Usage:**
   ```sql
   -- Check index usage
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0;
   ```

## Success Criteria

- ✅ All migrations complete without errors
- ✅ No data loss (record counts match before/after)
- ✅ All API endpoints return 200 OK
- ✅ Transaction navigation works
- ✅ Multi-item transactions save correctly
- ✅ Duplicate detection prevents redundant debts
- ✅ UI displays correctly for 1-to-1 and groups
- ✅ Performance meets targets (see monitoring)

## Support

If issues persist:
1. Check logs: `backend/logs/` and browser console
2. Review `IMPLEMENTATION_SUMMARY.md`
3. Rollback using migration revert commands

---

**Implementation Date:** 2025-11-14
**Branch:** `claude/transaction-list-navigation-01GWRrMB2t5a5gwvsGfYosfn`
**Status:** ✅ Ready for Deployment
