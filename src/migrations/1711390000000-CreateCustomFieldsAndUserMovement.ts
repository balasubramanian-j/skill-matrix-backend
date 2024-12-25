import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomFieldsAndUserMovement1711390000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create custom_fields table
    await queryRunner.query(`
        CREATE TABLE custom_fields (
          id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(255) UNIQUE NOT NULL,
          type ENUM('text', 'number', 'date', 'select', 'checkbox') NOT NULL,
          defaultValue VARCHAR(255),
          required BOOLEAN NOT NULL DEFAULT false,
          visibility ENUM('all', 'admin', 'manager') NOT NULL,
          options JSON
        );
    `);

    // Add new columns to users table
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN movementHistory JSON,
      ADD COLUMN customFields JSON;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns from users table
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN customFields,
      DROP COLUMN movementHistory;
    `);

    // Drop custom_fields table
    await queryRunner.query(`
      DROP TABLE custom_fields;
    `);

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE field_visibility_enum;
    `);

    await queryRunner.query(`
      DROP TYPE field_type_enum;
    `);
  }
} 