import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoanTable1778481044670 implements MigrationInterface {
  name = 'LoanTable1778481044670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "copy_id" integer NOT NULL, "user_id" integer NOT NULL, "borrowed_at" datetime NOT NULL, "due_date" date NOT NULL, "returned_at" datetime, "returned_by_user_id" integer)`
    );
    await queryRunner.query(`DROP INDEX "IDX_135936b6918bd375a4479b9231"`);
    await queryRunner.query(`DROP INDEX "IDX_065d4d8f3b5adb4a08841eae3c"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "employee_id" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('user'))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user"("id", "name", "employee_id", "role") SELECT "id", "name", "employee_id", "role" FROM "user"`
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_135936b6918bd375a4479b9231" ON "user" ("employee_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_065d4d8f3b5adb4a08841eae3c" ON "user" ("name") `
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_loan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "copy_id" integer NOT NULL, "user_id" integer NOT NULL, "borrowed_at" datetime NOT NULL, "due_date" date NOT NULL, "returned_at" datetime, "returned_by_user_id" integer, CONSTRAINT "FK_160686b997515629863207c6d90" FOREIGN KEY ("copy_id") REFERENCES "item_copy" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_53e13d0f4512c420ceb586f6737" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_5e18e5c1ab9c18245b5035ea32c" FOREIGN KEY ("returned_by_user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_loan"("id", "copy_id", "user_id", "borrowed_at", "due_date", "returned_at", "returned_by_user_id") SELECT "id", "copy_id", "user_id", "borrowed_at", "due_date", "returned_at", "returned_by_user_id" FROM "loan"`
    );
    await queryRunner.query(`DROP TABLE "loan"`);
    await queryRunner.query(`ALTER TABLE "temporary_loan" RENAME TO "loan"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_loan_active_copy_unique" ON "loan" ("copy_id") WHERE "returned_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_loan_active_copy_unique"`);
    await queryRunner.query(`ALTER TABLE "loan" RENAME TO "temporary_loan"`);
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "copy_id" integer NOT NULL, "user_id" integer NOT NULL, "borrowed_at" datetime NOT NULL, "due_date" date NOT NULL, "returned_at" datetime, "returned_by_user_id" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "loan"("id", "copy_id", "user_id", "borrowed_at", "due_date", "returned_at", "returned_by_user_id") SELECT "id", "copy_id", "user_id", "borrowed_at", "due_date", "returned_at", "returned_by_user_id" FROM "temporary_loan"`
    );
    await queryRunner.query(`DROP TABLE "temporary_loan"`);
    await queryRunner.query(`DROP INDEX "IDX_065d4d8f3b5adb4a08841eae3c"`);
    await queryRunner.query(`DROP INDEX "IDX_135936b6918bd375a4479b9231"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "employee_id" varchar NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "user"("id", "name", "employee_id") SELECT "id", "name", "employee_id" FROM "temporary_user"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_065d4d8f3b5adb4a08841eae3c" ON "user" ("name") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_135936b6918bd375a4479b9231" ON "user" ("employee_id") `
    );
    await queryRunner.query(`DROP TABLE "loan"`);
  }
}
