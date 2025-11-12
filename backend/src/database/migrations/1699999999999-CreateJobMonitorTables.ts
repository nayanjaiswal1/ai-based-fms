import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateJobMonitorTables1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create jobs table
    await queryRunner.createTable(
      new Table({
        name: 'jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'bullJobId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'queueName',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'email_sync',
              'transaction_import',
              'report_generation',
              'insights_generation',
              'budget_refresh',
              'notification_digest',
              'cache_cleanup',
              'backup_verification',
              'account_reconciliation',
              'data_export',
            ],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused', 'stuck'],
          },
          {
            name: 'priority',
            type: 'int',
            default: 2,
          },
          {
            name: 'data',
            type: 'jsonb',
          },
          {
            name: 'progress',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'result',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'stackTrace',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'maxAttempts',
            type: 'int',
            default: 3,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'startedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'failedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'processedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'int',
            default: 0,
          },
          {
            name: 'timeout',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'isDuplicate',
            type: 'boolean',
            default: false,
          },
          {
            name: 'deduplicationKey',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rateLimitKey',
            type: 'varchar',
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
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for jobs table
    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'IDX_jobs_status_createdAt',
        columnNames: ['status', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'IDX_jobs_type_status',
        columnNames: ['type', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'IDX_jobs_queueName_status',
        columnNames: ['queueName', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'IDX_jobs_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'IDX_jobs_bullJobId',
        columnNames: ['bullJobId'],
      }),
    );

    // Create job_logs table
    await queryRunner.createTable(
      new Table({
        name: 'job_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'jobId',
            type: 'uuid',
          },
          {
            name: 'level',
            type: 'enum',
            enum: ['debug', 'info', 'warning', 'error'],
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'context',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'stackTrace',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for job_logs table
    await queryRunner.createIndex(
      'job_logs',
      new TableIndex({
        name: 'IDX_job_logs_jobId_createdAt',
        columnNames: ['jobId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'job_logs',
      new TableIndex({
        name: 'IDX_job_logs_level',
        columnNames: ['level'],
      }),
    );

    // Create foreign key for job_logs -> jobs
    await queryRunner.createForeignKey(
      'job_logs',
      new TableForeignKey({
        columnNames: ['jobId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'jobs',
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key for jobs -> users (if userId is provided)
    await queryRunner.createForeignKey(
      'jobs',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const jobLogsTable = await queryRunner.getTable('job_logs');
    const jobLogsForeignKey = jobLogsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('jobId') !== -1,
    );
    if (jobLogsForeignKey) {
      await queryRunner.dropForeignKey('job_logs', jobLogsForeignKey);
    }

    const jobsTable = await queryRunner.getTable('jobs');
    const jobsUserForeignKey = jobsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (jobsUserForeignKey) {
      await queryRunner.dropForeignKey('jobs', jobsUserForeignKey);
    }

    // Drop indexes
    await queryRunner.dropIndex('job_logs', 'IDX_job_logs_jobId_createdAt');
    await queryRunner.dropIndex('job_logs', 'IDX_job_logs_level');
    await queryRunner.dropIndex('jobs', 'IDX_jobs_status_createdAt');
    await queryRunner.dropIndex('jobs', 'IDX_jobs_type_status');
    await queryRunner.dropIndex('jobs', 'IDX_jobs_queueName_status');
    await queryRunner.dropIndex('jobs', 'IDX_jobs_userId');
    await queryRunner.dropIndex('jobs', 'IDX_jobs_bullJobId');

    // Drop tables
    await queryRunner.dropTable('job_logs');
    await queryRunner.dropTable('jobs');
  }
}
