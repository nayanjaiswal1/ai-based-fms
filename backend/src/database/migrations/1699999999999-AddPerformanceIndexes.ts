import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add performance indexes for frequently queried columns
 * These indexes will significantly improve query performance for:
 * - Transaction queries by user, date, account, category
 * - Budget queries by user and date range
 * - Account queries by user
 * - Analytics aggregations
 */
export class AddPerformanceIndexes1699999999999 implements MigrationInterface {
  name = 'AddPerformanceIndexes1699999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // TRANSACTION INDEXES
    // ========================================

    // Composite index for user + date (most common query pattern)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_user_date"
      ON "transactions" ("userId", "date" DESC)
    `);

    // Composite index for user + account (filter by account)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_user_account"
      ON "transactions" ("userId", "accountId")
    `);

    // Composite index for user + category (filter by category)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_user_category"
      ON "transactions" ("userId", "categoryId")
    `);

    // Composite index for user + type + date (income/expense queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_user_type_date"
      ON "transactions" ("userId", "type", "date" DESC)
    `);

    // Index for date range queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_date"
      ON "transactions" ("date" DESC)
    `);

    // Index for amount (for sum/aggregation queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_amount"
      ON "transactions" ("amount")
    `);

    // Composite index for analytics (user + date + category + type)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_analytics"
      ON "transactions" ("userId", "date", "categoryId", "type")
    `);

    // ========================================
    // BUDGET INDEXES
    // ========================================

    // Composite index for user + period
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_budgets_user_period"
      ON "budgets" ("userId", "period")
    `);

    // Composite index for user + category
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_budgets_user_category"
      ON "budgets" ("userId", "categoryId")
    `);

    // Composite index for user + start/end date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_budgets_user_dates"
      ON "budgets" ("userId", "startDate", "endDate")
    `);

    // ========================================
    // ACCOUNT INDEXES
    // ========================================

    // Index for user + type
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_accounts_user_type"
      ON "accounts" ("userId", "type")
    `);

    // Index for user + active status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_accounts_user_active"
      ON "accounts" ("userId", "isActive")
    `);

    // ========================================
    // CATEGORY INDEXES
    // ========================================

    // Index for user + type
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_categories_user_type"
      ON "categories" ("userId", "type")
    `);

    // Index for parent category (for hierarchical queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_categories_parent"
      ON "categories" ("parentId")
    `);

    // ========================================
    // INVESTMENT INDEXES
    // ========================================

    // Composite index for user + account
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_investments_user_account"
      ON "investments" ("userId", "accountId")
    `);

    // Composite index for user + date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_investments_user_date"
      ON "investments" ("userId", "purchaseDate" DESC)
    `);

    // ========================================
    // LEND/BORROW INDEXES
    // ========================================

    // Composite index for user + type + status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_lend_borrow_user_type_status"
      ON "lend_borrow" ("userId", "type", "status")
    `);

    // Composite index for user + due date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_lend_borrow_user_due_date"
      ON "lend_borrow" ("userId", "dueDate")
    `);

    // ========================================
    // NOTIFICATION INDEXES
    // ========================================

    // Composite index for user + read status + date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_read_date"
      ON "notifications" ("userId", "isRead", "createdAt" DESC)
    `);

    // ========================================
    // AUDIT LOG INDEXES
    // ========================================

    // Composite index for user + entity + date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_entity_date"
      ON "audit_logs" ("userId", "entityType", "createdAt" DESC)
    `);

    // Index for entity + entityId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity"
      ON "audit_logs" ("entityType", "entityId")
    `);

    // ========================================
    // OPTIMIZATION: ANALYZE TABLES
    // ========================================
    // This updates table statistics for the query planner

    await queryRunner.query(`ANALYZE transactions`);
    await queryRunner.query(`ANALYZE budgets`);
    await queryRunner.query(`ANALYZE accounts`);
    await queryRunner.query(`ANALYZE categories`);
    await queryRunner.query(`ANALYZE investments`);
    await queryRunner.query(`ANALYZE lend_borrow`);
    await queryRunner.query(`ANALYZE notifications`);
    await queryRunner.query(`ANALYZE audit_logs`);

    console.log('✅ Performance indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order

    // Audit logs
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_entity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_user_entity_date"`);

    // Notifications
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_user_read_date"`);

    // Lend/Borrow
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lend_borrow_user_due_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lend_borrow_user_type_status"`);

    // Investments
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_investments_user_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_investments_user_account"`);

    // Categories
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_categories_parent"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_categories_user_type"`);

    // Accounts
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_accounts_user_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_accounts_user_type"`);

    // Budgets
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_budgets_user_dates"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_budgets_user_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_budgets_user_period"`);

    // Transactions
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_analytics"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_amount"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_user_type_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_user_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_user_account"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_user_date"`);

    console.log('✅ Performance indexes dropped successfully');
  }
}
