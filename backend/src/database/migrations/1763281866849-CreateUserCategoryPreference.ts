import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserCategoryPreference1763281866849 implements MigrationInterface {
    name = 'CreateUserCategoryPreference1763281866849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_category_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "categoryId" uuid NOT NULL, "isHidden" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1cdea97913dd439846f8b0a5a57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_69a534cd69a08d52537f0c9cee" ON "user_category_preferences" ("userId", "categoryId") `);
        await queryRunner.query(`ALTER TABLE "user_category_preferences" ADD CONSTRAINT "FK_edd97c371ce2ecb87a01cafc2ea" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_category_preferences" ADD CONSTRAINT "FK_c7f164ec4eb0059351ccd03f1cf" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_category_preferences" DROP CONSTRAINT "FK_c7f164ec4eb0059351ccd03f1cf"`);
        await queryRunner.query(`ALTER TABLE "user_category_preferences" DROP CONSTRAINT "FK_edd97c371ce2ecb87a01cafc2ea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69a534cd69a08d52537f0c9cee"`);
        await queryRunner.query(`DROP TABLE "user_category_preferences"`);
    }

}
