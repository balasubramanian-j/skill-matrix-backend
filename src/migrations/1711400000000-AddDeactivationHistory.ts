import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeactivationHistory1711400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN deactivationHistory JSON;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN deactivationHistory;
    `);
  }
} 