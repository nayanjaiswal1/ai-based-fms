# Database Permission Error Fix

## Problem
TypeORM cannot drop the `returns` column from the `investments` table because the database user (`fms_user`) doesn't own the table.

## Solutions

### Option 1: Fix Database Permissions (Quick Fix)

Run the SQL script to grant proper permissions:

```powershell
# Connect to PostgreSQL as superuser
psql -U postgres -d fms_db -f backend\fix-permissions.sql
```

Or manually in psql:
```sql
-- Connect as postgres superuser
psql -U postgres

-- Connect to the database
\c fms_db

-- Grant ownership
ALTER TABLE investments OWNER TO fms_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fms_user;
```

### Option 2: Use Migrations Instead of Auto-Sync (ALREADY APPLIED)

I've disabled `synchronize` in your database config. This is the recommended approach for production-like environments.

Now you need to:

1. **Create a migration** to drop the `returns` column:
```powershell
cd backend
npm run typeorm migration:generate -- src/database/migrations/RemoveReturnsColumn
```

2. **Run the migration**:
```powershell
npm run typeorm migration:run
```

### Option 3: Manual Column Drop

If you don't need the `returns` column and have permissions, drop it manually:

```sql
-- Connect as a user with proper permissions
ALTER TABLE investments DROP COLUMN IF EXISTS returns;
```

## Recommended Approach

For **development**: Use Option 1 (fix permissions) + keep synchronize enabled for rapid development
For **production**: Use Option 2 (migrations only) - ALREADY CONFIGURED

## Current Status

✅ Schema synchronization has been disabled in database.config.ts
✅ SQL script created at `backend/fix-permissions.sql`

## Next Steps

1. Run the permissions script OR
2. Drop the column manually OR  
3. Generate and run a migration

After fixing permissions/column, restart your backend server.
