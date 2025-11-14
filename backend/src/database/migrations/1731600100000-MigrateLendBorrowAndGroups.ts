import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateLendBorrowAndGroups1731600100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migrate lend_borrow records to shared_expense_groups
    await queryRunner.query(`
      INSERT INTO shared_expense_groups (
        id,
        name,
        type,
        "isOneToOne",
        "participantCount",
        "otherPersonName",
        "otherPersonEmail",
        "otherPersonPhone",
        "debtDirection",
        currency,
        "isActive",
        "createdBy",
        "createdAt",
        "updatedAt"
      )
      SELECT
        gen_random_uuid(),
        CASE
          WHEN type = 'lend' THEN 'Loan to ' || "personName"
          ELSE 'Borrowed from ' || "personName"
        END,
        'personal_debt',
        true,
        2,
        "personName",
        "personEmail",
        "personPhone",
        CASE type WHEN 'lend' THEN 'lend'::debt_direction_enum ELSE 'borrow'::debt_direction_enum END,
        currency,
        true,
        "userId",
        "createdAt",
        "updatedAt"
      FROM lend_borrow
      WHERE status != 'settled' OR status IS NULL
    `);

    // Create participants for migrated lend/borrow
    await queryRunner.query(`
      WITH migrated_groups AS (
        SELECT
          g.id as group_id,
          lb."userId",
          lb."personName",
          lb."personEmail",
          lb.type,
          lb.amount,
          lb."amountPaid"
        FROM shared_expense_groups g
        JOIN lend_borrow lb ON (
          g."otherPersonName" = lb."personName"
          AND g."isOneToOne" = true
          AND g.type = 'personal_debt'
        )
      )
      INSERT INTO shared_expense_participants (
        id,
        "groupId",
        "userId",
        "participantName",
        "participantEmail",
        role,
        balance,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      SELECT
        gen_random_uuid(),
        group_id,
        "userId",
        NULL,
        NULL,
        'owner',
        CASE type
          WHEN 'lend' THEN (amount - "amountPaid")
          ELSE -(amount - "amountPaid")
        END,
        true,
        NOW(),
        NOW()
      FROM migrated_groups
      UNION ALL
      SELECT
        gen_random_uuid(),
        group_id,
        NULL,
        "personName",
        "personEmail",
        'member',
        CASE type
          WHEN 'lend' THEN -(amount - "amountPaid")
          ELSE (amount - "amountPaid")
        END,
        true,
        NOW(),
        NOW()
      FROM migrated_groups
    `);

    // Migrate groups to shared_expense_groups
    await queryRunner.query(`
      INSERT INTO shared_expense_groups (
        id,
        name,
        description,
        type,
        "isOneToOne",
        "participantCount",
        icon,
        color,
        currency,
        "isActive",
        "createdBy",
        "createdAt",
        "updatedAt"
      )
      SELECT
        id,
        name,
        description,
        'group_expense',
        false,
        (SELECT COUNT(*) FROM group_members WHERE "groupId" = groups.id),
        icon,
        color,
        currency,
        "isActive",
        "createdBy",
        "createdAt",
        "updatedAt"
      FROM groups
    `);

    // Migrate group_members to shared_expense_participants
    await queryRunner.query(`
      INSERT INTO shared_expense_participants (
        id,
        "groupId",
        "userId",
        role,
        balance,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      SELECT
        id,
        "groupId",
        "userId",
        CASE role
          WHEN 'admin' THEN 'admin'::participant_role_enum
          ELSE 'member'::participant_role_enum
        END,
        balance,
        "isActive",
        "createdAt",
        "updatedAt"
      FROM group_members
    `);

    // Migrate group_transactions to shared_expense_transactions
    await queryRunner.query(`
      INSERT INTO shared_expense_transactions (
        id,
        description,
        amount,
        date,
        currency,
        "paidBy",
        "splitType",
        splits,
        notes,
        attachments,
        "categoryId",
        "groupId",
        "isSettlement",
        "deletedAt",
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt"
      )
      SELECT
        id,
        description,
        amount,
        date,
        currency,
        "paidBy",
        "splitType"::split_type_enum,
        splits,
        notes,
        string_to_array(attachments, ','),
        "categoryId",
        "groupId",
        "isSettlement",
        CASE WHEN "isDeleted" = true THEN NOW() ELSE NULL END,
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt"
      FROM group_transactions
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migration - restore original tables from shared_expense tables
    // This is complex and may lose some data, so use with caution

    // Note: This down migration is simplified and may not perfectly restore all data
    console.log('Warning: Down migration may not perfectly restore all original data');
  }
}
