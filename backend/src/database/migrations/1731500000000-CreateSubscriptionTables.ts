import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSubscriptionTables1731500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'tier',
            type: 'enum',
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: "'free'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'canceled', 'expired', 'past_due', 'trialing'],
            default: "'active'",
          },
          {
            name: 'billingCycle',
            type: 'enum',
            enum: ['monthly', 'yearly'],
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'stripeCustomerId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripeSubscriptionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripePriceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'currentPeriodStart',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'currentPeriodEnd',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'trialStart',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'trialEnd',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'canceledAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelAtPeriodEnd',
            type: 'boolean',
            default: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign key for subscriptions -> users
    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create index on userId for faster lookups
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTION_USER',
        columnNames: ['userId'],
      }),
    );

    // Create usage_tracking table
    await queryRunner.createTable(
      new Table({
        name: 'usage_tracking',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'period',
            type: 'varchar',
          },
          {
            name: 'transactionsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'accountsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'budgetsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'groupsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'investmentsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'reportsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'apiCallsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'exportsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'importsCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'storageUsed',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'aiAssistantCalls',
            type: 'int',
            default: 0,
          },
          {
            name: 'advancedAnalyticsViews',
            type: 'int',
            default: 0,
          },
          {
            name: 'insightsGenerated',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastUpdated',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign key for usage_tracking -> users
    await queryRunner.createForeignKey(
      'usage_tracking',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create composite index on userId and period
    await queryRunner.createIndex(
      'usage_tracking',
      new TableIndex({
        name: 'IDX_USAGE_USER_PERIOD',
        columnNames: ['userId', 'period'],
      }),
    );

    // Create invoices table
    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'invoiceNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'stripeInvoiceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
            default: "'draft'",
          },
          {
            name: 'tier',
            type: 'enum',
            enum: ['free', 'basic', 'premium', 'enterprise'],
          },
          {
            name: 'billingCycle',
            type: 'enum',
            enum: ['monthly', 'yearly'],
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
          },
          {
            name: 'periodStart',
            type: 'timestamp',
          },
          {
            name: 'periodEnd',
            type: 'timestamp',
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paidAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'receiptUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pdfUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lineItems',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign key for invoices -> users
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create index on userId and status
    await queryRunner.createIndex(
      'invoices',
      new TableIndex({
        name: 'IDX_INVOICE_USER_STATUS',
        columnNames: ['userId', 'status'],
      }),
    );

    // Update users table - modify subscription enum to match new tiers
    // Note: This requires careful handling of existing data
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN "subscriptionTier" TYPE varchar;
    `);

    await queryRunner.query(`
      UPDATE users
      SET "subscriptionTier" = 'basic'
      WHERE "subscriptionTier" = 'pro';
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "users_subscriptiontier_enum" CASCADE;
    `);

    await queryRunner.query(`
      CREATE TYPE "users_subscriptiontier_enum" AS ENUM ('free', 'basic', 'premium', 'enterprise');
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN "subscriptionTier" TYPE "users_subscriptiontier_enum"
      USING "subscriptionTier"::"users_subscriptiontier_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN "subscriptionTier" SET DEFAULT 'free';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('invoices', true);
    await queryRunner.dropTable('usage_tracking', true);
    await queryRunner.dropTable('subscriptions', true);

    // Revert users table changes
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN "subscriptionTier" TYPE varchar;
    `);

    await queryRunner.query(`
      UPDATE users
      SET "subscriptionTier" = 'pro'
      WHERE "subscriptionTier" = 'basic';
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "users_subscriptiontier_enum" CASCADE;
    `);

    await queryRunner.query(`
      CREATE TYPE "users_subscriptiontier_enum" AS ENUM ('free', 'pro', 'enterprise');
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN "subscriptionTier" TYPE "users_subscriptiontier_enum"
      USING "subscriptionTier"::"users_subscriptiontier_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN "subscriptionTier" SET DEFAULT 'free';
    `);
  }
}
