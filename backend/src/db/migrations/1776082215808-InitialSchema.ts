import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1776082215808 implements MigrationInterface {
  name = 'InitialSchema1776082215808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "employee_id" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('user'))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_065d4d8f3b5adb4a08841eae3c" ON "user" ("name") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_135936b6918bd375a4479b9231" ON "user" ("employee_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "city" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "archived_at" datetime)`
    );
    await queryRunner.query(
      `CREATE TABLE "location" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "city_id" integer NOT NULL, "archived_at" datetime)`
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text, "image_url" varchar, "default_loan_days" integer NOT NULL, "archived_at" datetime)`
    );
    await queryRunner.query(
      `CREATE TABLE "item_copy" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "item_id" integer NOT NULL, "location_id" integer NOT NULL, "condition" varchar, "archived_at" datetime)`
    );
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "copy_id" integer NOT NULL, "user_id" integer NOT NULL, "borrowed_at" datetime NOT NULL, "due_date" date NOT NULL, "returned_at" datetime, "returned_by_user_id" integer)`
    );
    await queryRunner.query(
      `CREATE TABLE "item_tag" ("item_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("item_id", "tag_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "archived_at" datetime)`
    );
    await queryRunner.query(
      `CREATE TABLE "item_category" ("item_id" integer NOT NULL, "category_id" integer NOT NULL, PRIMARY KEY ("item_id", "category_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "email_notification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "loan_id" integer NOT NULL, "type" varchar NOT NULL, "sent_at" datetime NOT NULL)`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_location" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "city_id" integer NOT NULL, "archived_at" datetime, CONSTRAINT "FK_9b39df0d2f03086c87be0efc46f" FOREIGN KEY ("city_id") REFERENCES "city" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_location"("id", "name", "city_id", "archived_at") SELECT "id", "name", "city_id", "archived_at" FROM "location"`
    );
    await queryRunner.query(`DROP TABLE "location"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_location" RENAME TO "location"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_item_copy" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "item_id" integer NOT NULL, "location_id" integer NOT NULL, "condition" varchar, "archived_at" datetime, CONSTRAINT "FK_7f9ca789538256ddffa030c7987" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_429010cf57c7a5ba9cf5246951f" FOREIGN KEY ("location_id") REFERENCES "location" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_copy"("id", "item_id", "location_id", "condition", "archived_at") SELECT "id", "item_id", "location_id", "condition", "archived_at" FROM "item_copy"`
    );
    await queryRunner.query(`DROP TABLE "item_copy"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_copy" RENAME TO "item_copy"`
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
      `CREATE TABLE "temporary_item_tag" ("item_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "FK_39b492fda03c7ac846afe164b58" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_16ab8afb42f763f7cbaa4bff66a" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("item_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_tag"("item_id", "tag_id") SELECT "item_id", "tag_id" FROM "item_tag"`
    );
    await queryRunner.query(`DROP TABLE "item_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_tag" RENAME TO "item_tag"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_item_category" ("item_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "FK_42bc3af8906e12365293438a937" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_638552fc7d9a2035c2b53182d8a" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("item_id", "category_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_category"("item_id", "category_id") SELECT "item_id", "category_id" FROM "item_category"`
    );
    await queryRunner.query(`DROP TABLE "item_category"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_category" RENAME TO "item_category"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_email_notification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "loan_id" integer NOT NULL, "type" varchar NOT NULL, "sent_at" datetime NOT NULL, CONSTRAINT "FK_c6e461a1068ef8655aa7d61ca55" FOREIGN KEY ("loan_id") REFERENCES "loan" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_email_notification"("id", "loan_id", "type", "sent_at") SELECT "id", "loan_id", "type", "sent_at" FROM "email_notification"`
    );
    await queryRunner.query(`DROP TABLE "email_notification"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_email_notification" RENAME TO "email_notification"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_notification" RENAME TO "temporary_email_notification"`
    );
    await queryRunner.query(
      `CREATE TABLE "email_notification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "loan_id" integer NOT NULL, "type" varchar NOT NULL, "sent_at" datetime NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "email_notification"("id", "loan_id", "type", "sent_at") SELECT "id", "loan_id", "type", "sent_at" FROM "temporary_email_notification"`
    );
    await queryRunner.query(`DROP TABLE "temporary_email_notification"`);
    await queryRunner.query(
      `ALTER TABLE "item_category" RENAME TO "temporary_item_category"`
    );
    await queryRunner.query(
      `CREATE TABLE "item_category" ("item_id" integer NOT NULL, "category_id" integer NOT NULL, PRIMARY KEY ("item_id", "category_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "item_category"("item_id", "category_id") SELECT "item_id", "category_id" FROM "temporary_item_category"`
    );
    await queryRunner.query(`DROP TABLE "temporary_item_category"`);
    await queryRunner.query(
      `ALTER TABLE "item_tag" RENAME TO "temporary_item_tag"`
    );
    await queryRunner.query(
      `CREATE TABLE "item_tag" ("item_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("item_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "item_tag"("item_id", "tag_id") SELECT "item_id", "tag_id" FROM "temporary_item_tag"`
    );
    await queryRunner.query(`DROP TABLE "temporary_item_tag"`);
    await queryRunner.query(`ALTER TABLE "loan" RENAME TO "temporary_loan"`);
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "copy_id" integer NOT NULL, "user_id" integer NOT NULL, "borrowed_at" datetime NOT NULL, "due_date" date NOT NULL, "returned_at" datetime, "returned_by_user_id" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "loan"("id", "copy_id", "user_id", "borrowed_at", "due_date", "returned_at", "returned_by_user_id") SELECT "id", "copy_id", "user_id", "borrowed_at", "due_date", "returned_at", "returned_by_user_id" FROM "temporary_loan"`
    );
    await queryRunner.query(`DROP TABLE "temporary_loan"`);
    await queryRunner.query(
      `ALTER TABLE "item_copy" RENAME TO "temporary_item_copy"`
    );
    await queryRunner.query(
      `CREATE TABLE "item_copy" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "item_id" integer NOT NULL, "location_id" integer NOT NULL, "condition" varchar, "archived_at" datetime)`
    );
    await queryRunner.query(
      `INSERT INTO "item_copy"("id", "item_id", "location_id", "condition", "archived_at") SELECT "id", "item_id", "location_id", "condition", "archived_at" FROM "temporary_item_copy"`
    );
    await queryRunner.query(`DROP TABLE "temporary_item_copy"`);
    await queryRunner.query(
      `ALTER TABLE "location" RENAME TO "temporary_location"`
    );
    await queryRunner.query(
      `CREATE TABLE "location" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "city_id" integer NOT NULL, "archived_at" datetime)`
    );
    await queryRunner.query(
      `INSERT INTO "location"("id", "name", "city_id", "archived_at") SELECT "id", "name", "city_id", "archived_at" FROM "temporary_location"`
    );
    await queryRunner.query(`DROP TABLE "temporary_location"`);
    await queryRunner.query(`DROP TABLE "email_notification"`);
    await queryRunner.query(`DROP TABLE "item_category"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "item_tag"`);
    await queryRunner.query(`DROP TABLE "loan"`);
    await queryRunner.query(`DROP TABLE "item_copy"`);
    await queryRunner.query(`DROP TABLE "item"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "location"`);
    await queryRunner.query(`DROP TABLE "city"`);
    await queryRunner.query(`DROP INDEX "IDX_135936b6918bd375a4479b9231"`);
    await queryRunner.query(`DROP INDEX "IDX_065d4d8f3b5adb4a08841eae3c"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
