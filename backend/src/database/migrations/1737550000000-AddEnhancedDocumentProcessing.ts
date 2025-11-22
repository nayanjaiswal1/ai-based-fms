import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnhancedDocumentProcessing1737550000000 implements MigrationInterface {
    name = 'AddEnhancedDocumentProcessing1737550000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enums for document processing
        await queryRunner.query(`CREATE TYPE "public"."document_processing_requests_provider_enum" AS ENUM('openai', 'gemini', 'ocr_space')`);
        await queryRunner.query(`CREATE TYPE "public"."document_processing_requests_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);

        // Create document_processing_requests table
        await queryRunner.query(`
            CREATE TABLE "document_processing_requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "fileName" character varying NOT NULL,
                "originalFileName" character varying NOT NULL,
                "filePath" character varying NOT NULL,
                "fileSize" integer NOT NULL,
                "mimeType" character varying NOT NULL,
                "provider" "public"."document_processing_requests_provider_enum" NOT NULL,
                "status" "public"."document_processing_requests_status_enum" NOT NULL DEFAULT 'pending',
                "subscriptionTier" character varying,
                "requestPayload" jsonb,
                "originalRequestId" uuid,
                "retryCount" integer NOT NULL DEFAULT 0,
                "providerHistory" text,
                "errorMessage" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_document_processing_requests" PRIMARY KEY ("id")
            )
        `);

        // Create document_processing_responses table
        await queryRunner.query(`
            CREATE TABLE "document_processing_responses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "requestId" uuid NOT NULL,
                "provider" character varying NOT NULL,
                "responsePayload" jsonb NOT NULL,
                "extractedData" jsonb NOT NULL,
                "userEditedData" jsonb,
                "wasEdited" boolean NOT NULL DEFAULT false,
                "editedFields" text,
                "editedAt" TIMESTAMP,
                "editedByUserId" character varying,
                "confidence" decimal(10,2),
                "processingTimeMs" integer,
                "tokensUsed" integer,
                "cost" decimal(10,6) NOT NULL DEFAULT 0,
                "errorMessage" text,
                "completedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_document_processing_responses" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_doc_proc_req_userId_createdAt" ON "document_processing_requests" ("userId", "createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_doc_proc_req_provider_status" ON "document_processing_requests" ("provider", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_doc_proc_req_originalRequestId" ON "document_processing_requests" ("originalRequestId")`);

        await queryRunner.query(`CREATE INDEX "IDX_doc_proc_resp_requestId" ON "document_processing_responses" ("requestId")`);
        await queryRunner.query(`CREATE INDEX "IDX_doc_proc_resp_provider_createdAt" ON "document_processing_responses" ("provider", "completedAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_doc_proc_resp_wasEdited" ON "document_processing_responses" ("wasEdited")`);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "document_processing_requests"
            ADD CONSTRAINT "FK_doc_proc_req_userId"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "document_processing_requests"
            ADD CONSTRAINT "FK_doc_proc_req_originalRequestId"
            FOREIGN KEY ("originalRequestId") REFERENCES "document_processing_requests"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "document_processing_responses"
            ADD CONSTRAINT "FK_doc_proc_resp_requestId"
            FOREIGN KEY ("requestId") REFERENCES "document_processing_requests"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "document_processing_responses" DROP CONSTRAINT "FK_doc_proc_resp_requestId"`);
        await queryRunner.query(`ALTER TABLE "document_processing_requests" DROP CONSTRAINT "FK_doc_proc_req_originalRequestId"`);
        await queryRunner.query(`ALTER TABLE "document_processing_requests" DROP CONSTRAINT "FK_doc_proc_req_userId"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_doc_proc_resp_wasEdited"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_doc_proc_resp_provider_createdAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_doc_proc_resp_requestId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_doc_proc_req_originalRequestId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_doc_proc_req_provider_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_doc_proc_req_userId_createdAt"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "document_processing_responses"`);
        await queryRunner.query(`DROP TABLE "document_processing_requests"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE "public"."document_processing_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_processing_requests_provider_enum"`);
    }
}
