import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUser1776082215808 implements MigrationInterface {
  name = 'AddRoleToUser1776082215808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "role" varchar NOT NULL DEFAULT 'user'`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite does not support DROP COLUMN — baseline schema migration handles this
  }
}
