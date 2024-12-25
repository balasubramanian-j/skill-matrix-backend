import { MigrationInterface, QueryRunner } from 'typeorm';
import { AssessmentStatus } from '../entities/skill-assessment.entity';

export class AddExplicitForeignKeyColumns1711430000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS skill_assessments`);

    // Create table with correct structure
    await queryRunner.query(`
      CREATE TABLE skill_assessments (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        userId CHAR(36) NOT NULL,
        skillId CHAR(36) NOT NULL,
        currentLevel INT NOT NULL,
        expectedLevel INT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        feedback TEXT NULL,
        certificationName VARCHAR(255) NULL,
        certificationUrl VARCHAR(255) NULL,
        assessmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX idx_skill_assessments_user ON skill_assessments(userId)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_skill_assessments_skill ON skill_assessments(skillId)
    `);

    // Insert sample data
    const users = await queryRunner.query(`SELECT id FROM users WHERE role = 'employee'`);
    const skills = await queryRunner.query(`SELECT id FROM skills`);

    for (const user of users) {
      for (const skill of skills) {
        await queryRunner.query(`
          INSERT INTO skill_assessments (
            id, userId, skillId, currentLevel, expectedLevel, 
            status, feedback, certificationName, certificationUrl
          ) VALUES (
            UUID(),
            '${user.id}',
            '${skill.id}',
            FLOOR(1 + RAND() * 4),
            FLOOR(2 + RAND() * 3),
            'completed',
            'Initial assessment completed',
            'Basic Certification',
            'https://example.com/cert'
          )
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_skill_assessments_user ON skill_assessments
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_skill_assessments_skill ON skill_assessments
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS skill_assessments`);
  }
} 