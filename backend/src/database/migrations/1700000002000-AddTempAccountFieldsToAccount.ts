import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTempAccountFieldsToAccount1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'isTemporary',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'tempAccountSource',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'linkedToAccountId',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('accounts', 'linkedToAccountId');
    await queryRunner.dropColumn('accounts', 'tempAccountSource');
    await queryRunner.dropColumn('accounts', 'isTemporary');
  }
}
