import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSlackNotification1779442488846 implements MigrationInterface {
  name = 'CreateSlackNotification1779442488846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "slack_notification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "loan_id" integer NOT NULL, "type" varchar NOT NULL, "sent_at" datetime NOT NULL, CONSTRAINT "UQ_ea4d7ae5b5977ab0f1d7c4fb127" UNIQUE ("loan_id", "type"))`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_slack_notification" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "loan_id" integer NOT NULL, "type" varchar NOT NULL, "sent_at" datetime NOT NULL, CONSTRAINT "UQ_ea4d7ae5b5977ab0f1d7c4fb127" UNIQUE ("loan_id", "type"), CONSTRAINT "FK_4b83f73b4e7714f53f12f7690c1" FOREIGN KEY ("loan_id") REFERENCES "loan" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_slack_notification"("id", "loan_id", "type", "sent_at") SELECT "id", "loan_id", "type", "sent_at" FROM "slack_notification"`
    );
    await queryRunner.query(`DROP TABLE "slack_notification"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_slack_notification" RENAME TO "slack_notification"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "slack_notification"`);
  }
}
