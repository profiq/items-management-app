import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1771410646182 implements MigrationInterface {
  name = 'Migration1771410646182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`pet_visit\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` datetime NOT NULL, \`petId\` int NULL, UNIQUE INDEX \`IDX_57033db834d7f8597a5295b7b5\` (\`date\`, \`petId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`office_pet\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`species\` varchar(255) NOT NULL, \`race\` varchar(255) NOT NULL, \`ownerId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`employee_id\` varchar(255) NOT NULL, INDEX \`IDX_065d4d8f3b5adb4a08841eae3c\` (\`name\`), UNIQUE INDEX \`IDX_135936b6918bd375a4479b9231\` (\`employee_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`pet_visit\` ADD CONSTRAINT \`FK_41377e7fcbb7b80989284b5100a\` FOREIGN KEY (\`petId\`) REFERENCES \`office_pet\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`office_pet\` ADD CONSTRAINT \`FK_15720ec3b1f9fb8304b3b500672\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`office_pet\` DROP FOREIGN KEY \`FK_15720ec3b1f9fb8304b3b500672\``
    );
    await queryRunner.query(
      `ALTER TABLE \`pet_visit\` DROP FOREIGN KEY \`FK_41377e7fcbb7b80989284b5100a\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_135936b6918bd375a4479b9231\` ON \`user\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_065d4d8f3b5adb4a08841eae3c\` ON \`user\``
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`office_pet\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_57033db834d7f8597a5295b7b5\` ON \`pet_visit\``
    );
    await queryRunner.query(`DROP TABLE \`pet_visit\``);
  }
}
