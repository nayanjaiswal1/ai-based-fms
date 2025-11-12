import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDeletedUsersTable1699900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deleted_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'originalUserId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create index on deletedAt for queries
    await queryRunner.createIndex(
      'deleted_users',
      new TableIndex({
        name: 'IDX_deleted_users_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );

    // Create index on originalUserId for audit purposes
    await queryRunner.createIndex(
      'deleted_users',
      new TableIndex({
        name: 'IDX_deleted_users_originalUserId',
        columnNames: ['originalUserId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deleted_users');
  }
}
