import { MigrationInterface, QueryRunner } from 'typeorm';
import { AssessmentStatus } from '../entities/skill-assessment.entity';

export class UpdateSkillAssessmentColumns1711415000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS skill_assessments;`);

    // Create table with correct structure
    await queryRunner.query(`
      CREATE TABLE skill_assessments (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        userId CHAR(36) NOT NULL,
        skillId CHAR(36) NOT NULL,
        currentLevel INT NOT NULL,
        expectedLevel INT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        feedback TEXT,
        assessmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
      );
    `);

    // Add indexes one by one
    await queryRunner.query(
      `CREATE INDEX idx_skill_assessments_user ON skill_assessments(userId);`
    );
    
    await queryRunner.query(
      `CREATE INDEX idx_skill_assessments_skill ON skill_assessments(skillId);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes one by one
    await queryRunner.query(
      `DROP INDEX idx_skill_assessments_user ON skill_assessments;`
    );
    
    await queryRunner.query(
      `DROP INDEX idx_skill_assessments_skill ON skill_assessments;`
    );

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS skill_assessments;`);
  }
} 