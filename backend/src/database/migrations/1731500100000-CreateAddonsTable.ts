import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAddonsTable1731500100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addons',
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
            type: 'enum',
            enum: ['storage', 'transactions', 'api_calls', 'users', 'reports', 'custom_feature'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'expired', 'canceled'],
            default: "'active'",
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'USD'",
          },
          {
            name: 'isRecurring',
            type: 'boolean',
            default: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'unit',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripeProductId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripePriceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'validFrom',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'validUntil',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'purchasedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'canceledAt',
            type: 'timestamp',
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

    // Create foreign key for addons -> users
    await queryRunner.createForeignKey(
      'addons',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create index on userId and status
    await queryRunner.createIndex(
      'addons',
      new TableIndex({
        name: 'IDX_ADDON_USER_STATUS',
        columnNames: ['userId', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('addons', true);
  }
}
