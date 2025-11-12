import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableColumn,
} from 'typeorm';

export class CreateReconciliationTables1699900000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add reconciliation fields to accounts table
    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'reconciliationStatus',
        type: 'enum',
        enum: ['none', 'in_progress', 'reconciled'],
        default: "'none'",
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'lastReconciledAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'lastReconciledBalance',
        type: 'decimal',
        precision: 15,
        scale: 2,
        isNullable: true,
      }),
    );

    // Create reconciliations table
    await queryRunner.createTable(
      new Table({
        name: 'reconciliations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'accountId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'startDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'endDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'statementBalance',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'reconciledBalance',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'difference',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['in_progress', 'completed', 'cancelled'],
            default: "'in_progress'",
            isNullable: false,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'matchedCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'unmatchedCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'statementTransactionCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'summary',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create reconciliation_transactions table
    await queryRunner.createTable(
      new Table({
        name: 'reconciliation_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reconciliationId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'transactionId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'matched',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'matchConfidence',
            type: 'enum',
            enum: ['exact', 'high', 'medium', 'low', 'manual'],
            isNullable: true,
          },
          {
            name: 'confidenceScore',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'statementAmount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'statementDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'statementDescription',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'statementReferenceNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isManualMatch',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'matchingDetails',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for reconciliations
    await queryRunner.createIndex(
      'reconciliations',
      new TableIndex({
        name: 'IDX_reconciliations_accountId_status',
        columnNames: ['accountId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'reconciliations',
      new TableIndex({
        name: 'IDX_reconciliations_userId_createdAt',
        columnNames: ['userId', 'createdAt'],
      }),
    );

    // Create indexes for reconciliation_transactions
    await queryRunner.createIndex(
      'reconciliation_transactions',
      new TableIndex({
        name: 'IDX_reconciliation_transactions_reconciliationId_matched',
        columnNames: ['reconciliationId', 'matched'],
      }),
    );

    // Create foreign keys for reconciliations
    await queryRunner.createForeignKey(
      'reconciliations',
      new TableForeignKey({
        columnNames: ['accountId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reconciliations',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign keys for reconciliation_transactions
    await queryRunner.createForeignKey(
      'reconciliation_transactions',
      new TableForeignKey({
        columnNames: ['reconciliationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'reconciliations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reconciliation_transactions',
      new TableForeignKey({
        columnNames: ['transactionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'transactions',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.dropTable('reconciliation_transactions');
    await queryRunner.dropTable('reconciliations');

    // Drop columns from accounts
    await queryRunner.dropColumn('accounts', 'lastReconciledBalance');
    await queryRunner.dropColumn('accounts', 'lastReconciledAt');
    await queryRunner.dropColumn('accounts', 'reconciliationStatus');
  }
}
