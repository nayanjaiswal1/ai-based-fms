import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailMessageTable1763298480792 implements MigrationInterface {
    name = 'CreateEmailMessageTable1763298480792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."email_messages_parsingstatus_enum" AS ENUM('pending', 'processing', 'success', 'failed', 'skipped', 'manually_edited')`);
        await queryRunner.query(`CREATE TABLE "email_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "connectionId" uuid NOT NULL, "messageId" character varying(100) NOT NULL, "threadId" character varying(100), "from" character varying(500) NOT NULL, "to" character varying(500), "subject" character varying(1000) NOT NULL, "emailDate" TIMESTAMP NOT NULL, "textContent" text, "htmlContent" text, "headers" jsonb, "parsingStatus" "public"."email_messages_parsingstatus_enum" NOT NULL DEFAULT 'pending', "parsedAt" TIMESTAMP, "parseAttempts" integer NOT NULL DEFAULT '0', "parsingError" text, "parsedData" jsonb, "manualEdits" jsonb, "labels" jsonb array, "isStarred" boolean NOT NULL DEFAULT false, "isArchived" boolean NOT NULL DEFAULT false, "attachmentCount" integer, "bodySize" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97c9496d029594ec19bf71419fa" UNIQUE ("messageId"), CONSTRAINT "PK_922cad79d5a315f5d1d06b077da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_messages" ADD CONSTRAINT "FK_13ce3ef8812049e88480c284b8e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_messages" ADD CONSTRAINT "FK_373b9564bad12d512fc48072619" FOREIGN KEY ("connectionId") REFERENCES "email_connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_messages" DROP CONSTRAINT "FK_373b9564bad12d512fc48072619"`);
        await queryRunner.query(`ALTER TABLE "email_messages" DROP CONSTRAINT "FK_13ce3ef8812049e88480c284b8e"`);
        await queryRunner.query(`DROP TABLE "email_messages"`);
        await queryRunner.query(`DROP TYPE "public"."email_messages_parsingstatus_enum"`);
    }

}
