import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateDashboardPreferences1731412800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_dashboard_preferences',
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
            name: 'widgets',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'gridColumns',
            type: 'integer',
            default: 3,
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

    await queryRunner.createForeignKey(
      'user_dashboard_preferences',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create index for faster lookups
    await queryRunner.query(
      'CREATE INDEX "IDX_user_dashboard_preferences_userId" ON "user_dashboard_preferences" ("userId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_user_dashboard_preferences_userId"');
    await queryRunner.dropTable('user_dashboard_preferences');
  }
}
