import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTransactionMergeFields1699900000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add mergedIntoId column
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'mergedIntoId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add isMerged column
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'isMerged',
        type: 'boolean',
        default: false,
      }),
    );

    // Add mergedAt column
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'mergedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Add duplicateExclusions column
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'duplicateExclusions',
        type: 'text',
        isNullable: true,
      }),
    );

    // Create index on mergedIntoId for faster queries
    await queryRunner.query(
      `CREATE INDEX "IDX_TRANSACTION_MERGED_INTO" ON "transactions" ("mergedIntoId") WHERE "mergedIntoId" IS NOT NULL`,
    );

    // Create index on isMerged for filtering
    await queryRunner.query(
      `CREATE INDEX "IDX_TRANSACTION_IS_MERGED" ON "transactions" ("isMerged")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_TRANSACTION_IS_MERGED"`);
    await queryRunner.query(`DROP INDEX "IDX_TRANSACTION_MERGED_INTO"`);

    // Drop columns
    await queryRunner.dropColumn('transactions', 'duplicateExclusions');
    await queryRunner.dropColumn('transactions', 'mergedAt');
    await queryRunner.dropColumn('transactions', 'isMerged');
    await queryRunner.dropColumn('transactions', 'mergedIntoId');
  }
}
