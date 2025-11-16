import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGroupIntegrationToLendBorrow1763284356006 implements MigrationInterface {
    name = 'AddGroupIntegrationToLendBorrow1763284356006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" ADD "isExternalContact" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD "externalName" character varying`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD "externalEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD "externalPhone" character varying`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" ADD "groupId" uuid`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" ADD "convertedToGroup" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_fdef099303bcf0ffd9a4a7b18f5"`);
        await queryRunner.query(`ALTER TABLE "group_members" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_fdef099303bcf0ffd9a4a7b18f5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" ADD CONSTRAINT "FK_065b0effd9e45196780590216f0" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lend_borrow" DROP CONSTRAINT "FK_065b0effd9e45196780590216f0"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_fdef099303bcf0ffd9a4a7b18f5"`);
        await queryRunner.query(`ALTER TABLE "group_members" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_fdef099303bcf0ffd9a4a7b18f5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" DROP COLUMN "convertedToGroup"`);
        await queryRunner.query(`ALTER TABLE "lend_borrow" DROP COLUMN "groupId"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "externalPhone"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "externalEmail"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "externalName"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "isExternalContact"`);
    }

}
