import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1776689962897 implements MigrationInterface {
  name = 'Migration1776689962897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_item_category" ("item_id" integer NOT NULL, "category_id" integer NOT NULL, PRIMARY KEY ("item_id", "category_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_category"("item_id", "category_id") SELECT "item_id", "category_id" FROM "item_category"`
    );
    await queryRunner.query(`DROP TABLE "item_category"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_category" RENAME TO "item_category"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_item_tag" ("item_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("item_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_tag"("item_id", "tag_id") SELECT "item_id", "tag_id" FROM "item_tag"`
    );
    await queryRunner.query(`DROP TABLE "item_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_tag" RENAME TO "item_tag"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42bc3af8906e12365293438a93" ON "item_category" ("item_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_638552fc7d9a2035c2b53182d8" ON "item_category" ("category_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39b492fda03c7ac846afe164b5" ON "item_tag" ("item_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16ab8afb42f763f7cbaa4bff66" ON "item_tag" ("tag_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_42bc3af8906e12365293438a93"`);
    await queryRunner.query(`DROP INDEX "IDX_638552fc7d9a2035c2b53182d8"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_item_category" ("item_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "FK_42bc3af8906e12365293438a937" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_638552fc7d9a2035c2b53182d8a" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("item_id", "category_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_category"("item_id", "category_id") SELECT "item_id", "category_id" FROM "item_category"`
    );
    await queryRunner.query(`DROP TABLE "item_category"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_category" RENAME TO "item_category"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42bc3af8906e12365293438a93" ON "item_category" ("item_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_638552fc7d9a2035c2b53182d8" ON "item_category" ("category_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_39b492fda03c7ac846afe164b5"`);
    await queryRunner.query(`DROP INDEX "IDX_16ab8afb42f763f7cbaa4bff66"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_item_tag" ("item_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "FK_39b492fda03c7ac846afe164b58" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_16ab8afb42f763f7cbaa4bff66a" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("item_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_item_tag"("item_id", "tag_id") SELECT "item_id", "tag_id" FROM "item_tag"`
    );
    await queryRunner.query(`DROP TABLE "item_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_item_tag" RENAME TO "item_tag"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39b492fda03c7ac846afe164b5" ON "item_tag" ("item_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16ab8afb42f763f7cbaa4bff66" ON "item_tag" ("tag_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_16ab8afb42f763f7cbaa4bff66"`);
    await queryRunner.query(`DROP INDEX "IDX_39b492fda03c7ac846afe164b5"`);
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
    await queryRunner.query(
      `CREATE INDEX "IDX_16ab8afb42f763f7cbaa4bff66" ON "item_tag" ("tag_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39b492fda03c7ac846afe164b5" ON "item_tag" ("item_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_638552fc7d9a2035c2b53182d8"`);
    await queryRunner.query(`DROP INDEX "IDX_42bc3af8906e12365293438a93"`);
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
      `CREATE INDEX "IDX_638552fc7d9a2035c2b53182d8" ON "item_category" ("category_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42bc3af8906e12365293438a93" ON "item_category" ("item_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_16ab8afb42f763f7cbaa4bff66"`);
    await queryRunner.query(`DROP INDEX "IDX_39b492fda03c7ac846afe164b5"`);
    await queryRunner.query(`DROP INDEX "IDX_638552fc7d9a2035c2b53182d8"`);
    await queryRunner.query(`DROP INDEX "IDX_42bc3af8906e12365293438a93"`);
    await queryRunner.query(
      `ALTER TABLE "item_tag" RENAME TO "temporary_item_tag"`
    );
    await queryRunner.query(
      `CREATE TABLE "item_tag" ("item_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "FK_16ab8afb42f763f7cbaa4bff66a" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_39b492fda03c7ac846afe164b58" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("item_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "item_tag"("item_id", "tag_id") SELECT "item_id", "tag_id" FROM "temporary_item_tag"`
    );
    await queryRunner.query(`DROP TABLE "temporary_item_tag"`);
    await queryRunner.query(
      `ALTER TABLE "item_category" RENAME TO "temporary_item_category"`
    );
    await queryRunner.query(
      `CREATE TABLE "item_category" ("item_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "FK_638552fc7d9a2035c2b53182d8a" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_42bc3af8906e12365293438a937" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("item_id", "category_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "item_category"("item_id", "category_id") SELECT "item_id", "category_id" FROM "temporary_item_category"`
    );
    await queryRunner.query(`DROP TABLE "temporary_item_category"`);
  }
}
