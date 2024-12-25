import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1710200000000 implements MigrationInterface {
  name = 'CreateRolesTable1710200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.query(`
      CREATE TABLE roles (
        id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL UNIQUE,
        permissions TEXT NOT NULL,
        description TEXT,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Create user_roles junction table
    await queryRunner.query(`
      CREATE TABLE user_roles (
        userId VARCHAR(36) NOT NULL,
        roleId VARCHAR(36) NOT NULL,
        PRIMARY KEY (userId, roleId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_roles`);
    await queryRunner.query(`DROP TABLE roles`);
  }
} 