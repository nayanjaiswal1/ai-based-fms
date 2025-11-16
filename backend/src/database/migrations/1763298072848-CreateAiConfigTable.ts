import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAiConfigTable1763298072848 implements MigrationInterface {
    name = 'CreateAiConfigTable1763298072848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ai_configs_provider_enum" AS ENUM('openai', 'ollama', 'anthropic', 'none')`);
        await queryRunner.query(`CREATE TABLE "ai_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "provider" "public"."ai_configs_provider_enum" NOT NULL DEFAULT 'none', "model" character varying(100), "apiKey" text, "apiEndpoint" character varying(500), "timeout" integer NOT NULL DEFAULT '30000', "modelParameters" jsonb, "features" jsonb, "requestCount" integer NOT NULL DEFAULT '0', "totalTokensUsed" integer NOT NULL DEFAULT '0', "lastUsedAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "errorMessage" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e062638208222edc23b70e8c31b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ai_configs" ADD CONSTRAINT "FK_1c8dd585dcd5b1805c3fe08efb1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_configs" DROP CONSTRAINT "FK_1c8dd585dcd5b1805c3fe08efb1"`);
        await queryRunner.query(`DROP TABLE "ai_configs"`);
        await queryRunner.query(`DROP TYPE "public"."ai_configs_provider_enum"`);
    }

}
