import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1710000000000 implements MigrationInterface {
  name = 'CreateInitialTables1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id VARCHAR(36) NOT NULL,
        employeeCode VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        employeeName VARCHAR(255) NOT NULL,
        businessUnit VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        officialEmail VARCHAR(255) NOT NULL UNIQUE,
        designation VARCHAR(255) NOT NULL,
        gender ENUM('M', 'F', 'O') NOT NULL,
        role VARCHAR(255) NOT NULL,
        dateOfJoining DATE NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT true,
        reportingManagerId VARCHAR(36),
        functionalManagerId VARCHAR(36),
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Add foreign keys for users table
    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT FK_reporting_manager 
      FOREIGN KEY (reportingManagerId) REFERENCES users(id)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT FK_functional_manager 
      FOREIGN KEY (functionalManagerId) REFERENCES users(id)
    `);

    // Create skills table
    await queryRunner.query(`
      CREATE TABLE skills (
        id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Create skill_assessments table
    await queryRunner.query(`
      CREATE TABLE skill_assessments (
        id VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        skillId VARCHAR(36) NOT NULL,
        currentLevel ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
        expectedLevel ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
        certificationName VARCHAR(255),
        certificationAuthority VARCHAR(255),
        certificationDate DATE,
        certificationUrl VARCHAR(255),
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (skillId) REFERENCES skills(id)
      ) ENGINE=InnoDB
    `);

    // Create help_desk_tickets table
    await queryRunner.query(`
      CREATE TABLE help_desk_tickets (
        id VARCHAR(36) NOT NULL,
        submittedById VARCHAR(36) NOT NULL,
        queryType VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
        assignedAdminId VARCHAR(36),
        adminNotes TEXT,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (submittedById) REFERENCES users(id),
        FOREIGN KEY (assignedAdminId) REFERENCES users(id)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE help_desk_tickets`);
    await queryRunner.query(`DROP TABLE skill_assessments`);
    await queryRunner.query(`DROP TABLE skills`);
    await queryRunner.query(`DROP TABLE users`);
  }
} 