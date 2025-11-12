import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateReportsTables1699900000040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create reports table
    await queryRunner.createTable(
      new Table({
        name: 'reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'config',
            type: 'jsonb',
          },
          {
            name: 'schedule',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isFavorite',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isShared',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sharedWithGroupIds',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'runCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'lastRunAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
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

    // Create foreign key for userId
    await queryRunner.createForeignKey(
      'reports',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for reports table
    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'IDX_REPORTS_USER_TYPE',
        columnNames: ['userId', 'type'],
      }),
    );

    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: 'IDX_REPORTS_USER_FAVORITE',
        columnNames: ['userId', 'isFavorite'],
      }),
    );

    // Create generated_reports table
    await queryRunner.createTable(
      new Table({
        name: 'generated_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reportId',
            type: 'uuid',
          },
          {
            name: 'format',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'fileUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fileName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fileSize',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'generatedBy',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key for reportId
    await queryRunner.createForeignKey(
      'generated_reports',
      new TableForeignKey({
        columnNames: ['reportId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'reports',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for generated_reports table
    await queryRunner.createIndex(
      'generated_reports',
      new TableIndex({
        name: 'IDX_GENERATED_REPORTS_REPORT_CREATED',
        columnNames: ['reportId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'generated_reports',
      new TableIndex({
        name: 'IDX_GENERATED_REPORTS_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for generated_reports
    await queryRunner.dropIndex('generated_reports', 'IDX_GENERATED_REPORTS_STATUS');
    await queryRunner.dropIndex('generated_reports', 'IDX_GENERATED_REPORTS_REPORT_CREATED');

    // Drop foreign key and table for generated_reports
    const generatedReportsTable = await queryRunner.getTable('generated_reports');
    const generatedReportsForeignKey = generatedReportsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('reportId') !== -1,
    );
    if (generatedReportsForeignKey) {
      await queryRunner.dropForeignKey('generated_reports', generatedReportsForeignKey);
    }
    await queryRunner.dropTable('generated_reports');

    // Drop indexes for reports
    await queryRunner.dropIndex('reports', 'IDX_REPORTS_USER_FAVORITE');
    await queryRunner.dropIndex('reports', 'IDX_REPORTS_USER_TYPE');

    // Drop foreign key and table for reports
    const reportsTable = await queryRunner.getTable('reports');
    const reportsForeignKey = reportsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (reportsForeignKey) {
      await queryRunner.dropForeignKey('reports', reportsForeignKey);
    }
    await queryRunner.dropTable('reports');
  }
}
