import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmailConnectionForGmailOAuth1763180334714 implements MigrationInterface {
    name = 'UpdateEmailConnectionForGmailOAuth1763180334714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transaction_line_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" uuid NOT NULL, "categoryId" uuid, "description" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "sortOrder" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49de91e16c52b342bfc02dac000" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a7a6a724f3c1992fb26f80d789" ON "transaction_line_items" ("transactionId") `);
        await queryRunner.query(`CREATE TYPE "public"."shared_expense_participants_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "shared_expense_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "groupId" uuid NOT NULL, "userId" uuid, "participantName" character varying, "participantEmail" character varying, "role" "public"."shared_expense_participants_role_enum" NOT NULL DEFAULT 'member', "balance" numeric(15,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de6f579f837d8cd7d40fcfe751a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c452908fa3271266e1a651389c" ON "shared_expense_participants" ("groupId", "userId") `);
        await queryRunner.query(`CREATE TYPE "public"."shared_expense_groups_type_enum" AS ENUM('personal_debt', 'group_expense', 'trip', 'household')`);
        await queryRunner.query(`CREATE TYPE "public"."shared_expense_groups_debtdirection_enum" AS ENUM('lend', 'borrow')`);
        await queryRunner.query(`CREATE TABLE "shared_expense_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "type" "public"."shared_expense_groups_type_enum" NOT NULL, "isOneToOne" boolean NOT NULL DEFAULT false, "participantCount" integer NOT NULL DEFAULT '2', "otherPersonName" character varying, "otherPersonEmail" character varying, "otherPersonPhone" character varying, "debtDirection" "public"."shared_expense_groups_debtdirection_enum", "icon" character varying, "color" character varying, "currency" character varying NOT NULL DEFAULT 'USD', "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9e2da354f25c2d830a8fa277926" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_07cfc4547c2ae61a7b18e0f40a" ON "shared_expense_groups" ("isOneToOne", "isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfe742520fdd67ee752446e407" ON "shared_expense_groups" ("createdBy", "isOneToOne") `);
        await queryRunner.query(`CREATE TYPE "public"."shared_expense_transactions_splittype_enum" AS ENUM('equal', 'custom', 'percentage', 'shares', 'full')`);
        await queryRunner.query(`CREATE TABLE "shared_expense_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "date" date NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "paidBy" character varying NOT NULL, "splitType" "public"."shared_expense_transactions_splittype_enum" NOT NULL DEFAULT 'equal', "splits" jsonb NOT NULL, "notes" text, "attachments" text, "categoryId" uuid, "groupId" uuid NOT NULL, "isSettlement" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP, "createdBy" character varying NOT NULL, "updatedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73b644492ac93557de38b046498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aa8e48aa9c9e63bc7e4a11017a" ON "shared_expense_transactions" ("groupId", "date") `);
        await queryRunner.query(`ALTER TABLE "budgets" DROP COLUMN "spent"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "returns"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "returnPercentage"`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" DROP COLUMN "amountRemaining"`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_sourcetype_enum" AS ENUM('manual', 'investment', 'shared_expense', 'recurring')`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "sourceType" "public"."transactions_sourcetype_enum" NOT NULL DEFAULT 'manual'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "sourceId" character varying`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "isVerified" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "statementPassword" text`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "isTemporary" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "tempAccountSource" text`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD "linkedToAccountId" uuid`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "accessToken" text`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "refreshToken" text`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "tokenExpiresAt" TIMESTAMP`);
        await queryRunner.query(`CREATE TYPE "public"."email_connections_status_enum" AS ENUM('connected', 'disconnected', 'error', 'syncing', 'expired')`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "status" "public"."email_connections_status_enum" NOT NULL DEFAULT 'disconnected'`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "errorMessage" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "lastSyncHistoryId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "ordersExtracted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "preferences" jsonb`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD "syncStats" jsonb`);
        await queryRunner.query(`ALTER TABLE "email_connections" ALTER COLUMN "encryptedPassword" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_6e43dcec1b431001441c3983cd" ON "transactions" ("sourceType", "sourceId") `);
        await queryRunner.query(`ALTER TABLE "transaction_line_items" ADD CONSTRAINT "FK_a7a6a724f3c1992fb26f80d789d" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction_line_items" ADD CONSTRAINT "FK_91408ba875d13b05f5e33ab30be" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shared_expense_participants" ADD CONSTRAINT "FK_e59e0fd593eb4573b4d139c32ea" FOREIGN KEY ("groupId") REFERENCES "shared_expense_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shared_expense_participants" ADD CONSTRAINT "FK_356748a64fccab022d426a99ffe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shared_expense_transactions" ADD CONSTRAINT "FK_5f35ed5eab41cccf3f3914f43f6" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shared_expense_transactions" ADD CONSTRAINT "FK_37970e3ecd44f15e2c46dcb7c9e" FOREIGN KEY ("groupId") REFERENCES "shared_expense_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shared_expense_transactions" DROP CONSTRAINT "FK_37970e3ecd44f15e2c46dcb7c9e"`);
        await queryRunner.query(`ALTER TABLE "shared_expense_transactions" DROP CONSTRAINT "FK_5f35ed5eab41cccf3f3914f43f6"`);
        await queryRunner.query(`ALTER TABLE "shared_expense_participants" DROP CONSTRAINT "FK_356748a64fccab022d426a99ffe"`);
        await queryRunner.query(`ALTER TABLE "shared_expense_participants" DROP CONSTRAINT "FK_e59e0fd593eb4573b4d139c32ea"`);
        await queryRunner.query(`ALTER TABLE "transaction_line_items" DROP CONSTRAINT "FK_91408ba875d13b05f5e33ab30be"`);
        await queryRunner.query(`ALTER TABLE "transaction_line_items" DROP CONSTRAINT "FK_a7a6a724f3c1992fb26f80d789d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e43dcec1b431001441c3983cd"`);
        await queryRunner.query(`ALTER TABLE "email_connections" ALTER COLUMN "encryptedPassword" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "syncStats"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "preferences"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "ordersExtracted"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "lastSyncHistoryId"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "errorMessage"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."email_connections_status_enum"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "tokenExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "refreshToken"`);
        await queryRunner.query(`ALTER TABLE "email_connections" DROP COLUMN "accessToken"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "linkedToAccountId"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "tempAccountSource"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "isTemporary"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "statementPassword"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "isVerified"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "sourceId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "sourceType"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_sourcetype_enum"`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" ADD "amountRemaining" numeric(15,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "returnPercentage" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "returns" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "budgets" ADD "spent" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa8e48aa9c9e63bc7e4a11017a"`);
        await queryRunner.query(`DROP TABLE "shared_expense_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."shared_expense_transactions_splittype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfe742520fdd67ee752446e407"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_07cfc4547c2ae61a7b18e0f40a"`);
        await queryRunner.query(`DROP TABLE "shared_expense_groups"`);
        await queryRunner.query(`DROP TYPE "public"."shared_expense_groups_debtdirection_enum"`);
        await queryRunner.query(`DROP TYPE "public"."shared_expense_groups_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c452908fa3271266e1a651389c"`);
        await queryRunner.query(`DROP TABLE "shared_expense_participants"`);
        await queryRunner.query(`DROP TYPE "public"."shared_expense_participants_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a7a6a724f3c1992fb26f80d789"`);
        await queryRunner.query(`DROP TABLE "transaction_line_items"`);
    }

}
