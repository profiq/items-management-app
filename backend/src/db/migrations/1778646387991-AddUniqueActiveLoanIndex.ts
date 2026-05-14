import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueActiveLoanIndex1778646387991 implements MigrationInterface {
  name = 'AddUniqueActiveLoanIndex1778646387991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_loan_active_copy_unique" ON "loan" ("copy_id") WHERE "returned_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_loan_active_copy_unique"`);
  }
}
