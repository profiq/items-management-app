import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772607826178 implements MigrationInterface {
  name = 'Migration1772607826178';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`office_pet\` ADD \`image_url\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`office_pet\` DROP COLUMN \`image_url\``
    );
  }
}
