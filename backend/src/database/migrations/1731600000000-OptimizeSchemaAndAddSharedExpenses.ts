import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeSchemaAndAddSharedExpenses1731600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove computed columns from Investment
    await queryRunner.query(
      `ALTER TABLE "investments" DROP COLUMN IF EXISTS "returns"`,
    );
    await queryRunner.query(
      `ALTER TABLE "investments" DROP COLUMN IF EXISTS "returnPercentage"`,
    );

    // 2. Remove computed column from LendBorrow
    await queryRunner.query(
      `ALTER TABLE "lend_borrow" DROP COLUMN IF EXISTS "amountRemaining"`,
    );

    // 3. Remove computed column from Budget
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP COLUMN IF EXISTS "spent"`,
    );

    // 4. Add source tracking to Transaction
    await queryRunner.query(
      `CREATE TYPE "transaction_source_type_enum" AS ENUM('manual', 'investment', 'shared_expense', 'recurring')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "sourceType" "transaction_source_type_enum" NOT NULL DEFAULT 'manual'`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "sourceId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transaction_source" ON "transactions" ("sourceType", "sourceId")`,
    );

    // 5. Create TransactionLineItem table
    await queryRunner.query(
      `CREATE TABLE "transaction_line_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "transactionId" uuid NOT NULL,
        "categoryId" uuid,
        "description" varchar NOT NULL,
        "amount" decimal(15,2) NOT NULL,
        "sortOrder" int NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_line_item_transaction" FOREIGN KEY ("transactionId")
          REFERENCES "transactions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_line_item_category" FOREIGN KEY ("categoryId")
          REFERENCES "categories"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_line_item_transaction" ON "transaction_line_items" ("transactionId")`,
    );

    // 6. Create SharedExpenseGroup table
    await queryRunner.query(
      `CREATE TYPE "shared_expense_type_enum" AS ENUM('personal_debt', 'group_expense', 'trip', 'household')`,
    );
    await queryRunner.query(
      `CREATE TYPE "debt_direction_enum" AS ENUM('lend', 'borrow')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shared_expense_groups" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text,
        "type" "shared_expense_type_enum" NOT NULL,
        "isOneToOne" boolean NOT NULL DEFAULT false,
        "participantCount" int NOT NULL DEFAULT 2,
        "otherPersonName" varchar,
        "otherPersonEmail" varchar,
        "otherPersonPhone" varchar,
        "debtDirection" "debt_direction_enum",
        "icon" varchar,
        "color" varchar,
        "currency" varchar NOT NULL DEFAULT 'USD',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_shared_expense_group_creator" ON "shared_expense_groups" ("createdBy", "isOneToOne")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_shared_expense_group_active" ON "shared_expense_groups" ("isOneToOne", "isActive")`,
    );

    // 7. Create SharedExpenseParticipant table
    await queryRunner.query(
      `CREATE TYPE "participant_role_enum" AS ENUM('owner', 'admin', 'member')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shared_expense_participants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "groupId" uuid NOT NULL,
        "userId" uuid,
        "participantName" varchar,
        "participantEmail" varchar,
        "role" "participant_role_enum" NOT NULL DEFAULT 'member',
        "balance" decimal(15,2) NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_participant_group" FOREIGN KEY ("groupId")
          REFERENCES "shared_expense_groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_participant_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_participant_group_user" ON "shared_expense_participants" ("groupId", "userId")`,
    );

    // 8. Create SharedExpenseTransaction table
    await queryRunner.query(
      `CREATE TYPE "split_type_enum" AS ENUM('equal', 'custom', 'percentage', 'shares', 'full')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shared_expense_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "description" varchar NOT NULL,
        "amount" decimal(15,2) NOT NULL,
        "date" date NOT NULL,
        "currency" varchar NOT NULL DEFAULT 'USD',
        "paidBy" varchar NOT NULL,
        "splitType" "split_type_enum" NOT NULL DEFAULT 'equal',
        "splits" jsonb NOT NULL,
        "notes" text,
        "attachments" text,
        "categoryId" uuid,
        "groupId" uuid NOT NULL,
        "isSettlement" boolean NOT NULL DEFAULT false,
        "deletedAt" TIMESTAMP,
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_shared_expense_tx_group" FOREIGN KEY ("groupId")
          REFERENCES "shared_expense_groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_shared_expense_tx_category" FOREIGN KEY ("categoryId")
          REFERENCES "categories"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_shared_expense_tx_group_date" ON "shared_expense_transactions" ("groupId", "date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new tables
    await queryRunner.query(`DROP TABLE IF EXISTS "shared_expense_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shared_expense_participants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shared_expense_groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction_line_items"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transaction_source"`);

    // Remove source tracking from Transaction
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "sourceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "sourceType"`,
    );

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "split_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "participant_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "debt_direction_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "shared_expense_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_source_type_enum"`);

    // Restore computed columns (if needed)
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD "spent" decimal(15,2) DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "lend_borrow" ADD "amountRemaining" decimal(15,2) DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "investments" ADD "returns" decimal(10,2) DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "investments" ADD "returnPercentage" decimal(10,2) DEFAULT 0`,
    );
  }
}
