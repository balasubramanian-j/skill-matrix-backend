import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordFields1710100000000 implements MigrationInterface {
  name = 'AddResetPasswordFields1710100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN resetOtp VARCHAR(255) NULL,
      ADD COLUMN resetOtpExpiry TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN resetOtp,
      DROP COLUMN resetOtpExpiry
    `);
  }
} 