import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782383288229 implements MigrationInterface {
  name = 'Migration1782383288229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`employee_id\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'user', INDEX \`IDX_065d4d8f3b5adb4a08841eae3c\` (\`name\`), UNIQUE INDEX \`IDX_135936b6918bd375a4479b9231\` (\`employee_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`archived_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`image_url\` varchar(255) NULL, \`default_loan_days\` int NOT NULL, \`archived_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`city\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`archived_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`location\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`city_id\` int NOT NULL, \`archived_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`item_copy\` (\`id\` int NOT NULL AUTO_INCREMENT, \`item_id\` int NOT NULL, \`location_id\` int NOT NULL, \`condition\` enum ('good', 'damaged', 'lost') NULL, \`archived_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`loan\` (\`id\` int NOT NULL AUTO_INCREMENT, \`copy_id\` int NOT NULL, \`user_id\` int NOT NULL, \`borrowed_at\` datetime NOT NULL, \`due_date\` date NOT NULL, \`returned_at\` datetime NULL, \`returned_by_user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`slack_notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`loan_id\` int NOT NULL, \`type\` varchar(50) NOT NULL, \`sent_at\` datetime NOT NULL, UNIQUE INDEX \`IDX_ea4d7ae5b5977ab0f1d7c4fb12\` (\`loan_id\`, \`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`email_notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`loan_id\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`sent_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`item_category\` (\`item_id\` int NOT NULL, \`category_id\` int NOT NULL, INDEX \`IDX_42bc3af8906e12365293438a93\` (\`item_id\`), INDEX \`IDX_638552fc7d9a2035c2b53182d8\` (\`category_id\`), PRIMARY KEY (\`item_id\`, \`category_id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`item_tag\` (\`item_id\` int NOT NULL, \`tag_id\` int NOT NULL, INDEX \`IDX_39b492fda03c7ac846afe164b5\` (\`item_id\`), INDEX \`IDX_16ab8afb42f763f7cbaa4bff66\` (\`tag_id\`), PRIMARY KEY (\`item_id\`, \`tag_id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`location\` ADD CONSTRAINT \`FK_9b39df0d2f03086c87be0efc46f\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`item_copy\` ADD CONSTRAINT \`FK_7f9ca789538256ddffa030c7987\` FOREIGN KEY (\`item_id\`) REFERENCES \`item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`item_copy\` ADD CONSTRAINT \`FK_429010cf57c7a5ba9cf5246951f\` FOREIGN KEY (\`location_id\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` ADD CONSTRAINT \`FK_160686b997515629863207c6d90\` FOREIGN KEY (\`copy_id\`) REFERENCES \`item_copy\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` ADD CONSTRAINT \`FK_53e13d0f4512c420ceb586f6737\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` ADD CONSTRAINT \`FK_5e18e5c1ab9c18245b5035ea32c\` FOREIGN KEY (\`returned_by_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`slack_notification\` ADD CONSTRAINT \`FK_4b83f73b4e7714f53f12f7690c1\` FOREIGN KEY (\`loan_id\`) REFERENCES \`loan\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`email_notification\` ADD CONSTRAINT \`FK_c6e461a1068ef8655aa7d61ca55\` FOREIGN KEY (\`loan_id\`) REFERENCES \`loan\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`item_category\` ADD CONSTRAINT \`FK_42bc3af8906e12365293438a937\` FOREIGN KEY (\`item_id\`) REFERENCES \`item\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`item_category\` ADD CONSTRAINT \`FK_638552fc7d9a2035c2b53182d8a\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`item_tag\` ADD CONSTRAINT \`FK_39b492fda03c7ac846afe164b58\` FOREIGN KEY (\`item_id\`) REFERENCES \`item\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE \`item_tag\` ADD CONSTRAINT \`FK_16ab8afb42f763f7cbaa4bff66a\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
    );
    // Enforce "at most one active (un-returned) loan per copy". MariaDB has no
    // partial indexes, so we emulate it with a STORED generated column that holds
    // copy_id only while the loan is active (NULL once returned) and a UNIQUE index
    // over it; UNIQUE ignores NULLs, so returned loans never collide.
    await queryRunner.query(
      `ALTER TABLE \`loan\` ADD \`active_copy_id\` int AS (IF(\`returned_at\` IS NULL, \`copy_id\`, NULL)) STORED`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_loan_active_copy_unique\` ON \`loan\` (\`active_copy_id\`)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_loan_active_copy_unique\` ON \`loan\``
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` DROP COLUMN \`active_copy_id\``
    );
    await queryRunner.query(
      `ALTER TABLE \`item_tag\` DROP FOREIGN KEY \`FK_16ab8afb42f763f7cbaa4bff66a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`item_tag\` DROP FOREIGN KEY \`FK_39b492fda03c7ac846afe164b58\``
    );
    await queryRunner.query(
      `ALTER TABLE \`item_category\` DROP FOREIGN KEY \`FK_638552fc7d9a2035c2b53182d8a\``
    );
    await queryRunner.query(
      `ALTER TABLE \`item_category\` DROP FOREIGN KEY \`FK_42bc3af8906e12365293438a937\``
    );
    await queryRunner.query(
      `ALTER TABLE \`email_notification\` DROP FOREIGN KEY \`FK_c6e461a1068ef8655aa7d61ca55\``
    );
    await queryRunner.query(
      `ALTER TABLE \`slack_notification\` DROP FOREIGN KEY \`FK_4b83f73b4e7714f53f12f7690c1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` DROP FOREIGN KEY \`FK_5e18e5c1ab9c18245b5035ea32c\``
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` DROP FOREIGN KEY \`FK_53e13d0f4512c420ceb586f6737\``
    );
    await queryRunner.query(
      `ALTER TABLE \`loan\` DROP FOREIGN KEY \`FK_160686b997515629863207c6d90\``
    );
    await queryRunner.query(
      `ALTER TABLE \`item_copy\` DROP FOREIGN KEY \`FK_429010cf57c7a5ba9cf5246951f\``
    );
    await queryRunner.query(
      `ALTER TABLE \`item_copy\` DROP FOREIGN KEY \`FK_7f9ca789538256ddffa030c7987\``
    );
    await queryRunner.query(
      `ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_9b39df0d2f03086c87be0efc46f\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_16ab8afb42f763f7cbaa4bff66\` ON \`item_tag\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_39b492fda03c7ac846afe164b5\` ON \`item_tag\``
    );
    await queryRunner.query(`DROP TABLE \`item_tag\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_638552fc7d9a2035c2b53182d8\` ON \`item_category\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_42bc3af8906e12365293438a93\` ON \`item_category\``
    );
    await queryRunner.query(`DROP TABLE \`item_category\``);
    await queryRunner.query(`DROP TABLE \`email_notification\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ea4d7ae5b5977ab0f1d7c4fb12\` ON \`slack_notification\``
    );
    await queryRunner.query(`DROP TABLE \`slack_notification\``);
    await queryRunner.query(`DROP TABLE \`loan\``);
    await queryRunner.query(`DROP TABLE \`item_copy\``);
    await queryRunner.query(`DROP TABLE \`location\``);
    await queryRunner.query(`DROP TABLE \`city\``);
    await queryRunner.query(`DROP TABLE \`item\``);
    await queryRunner.query(`DROP TABLE \`category\``);
    await queryRunner.query(`DROP TABLE \`tag\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_135936b6918bd375a4479b9231\` ON \`user\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_065d4d8f3b5adb4a08841eae3c\` ON \`user\``
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
