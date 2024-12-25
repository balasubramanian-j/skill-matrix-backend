import { MigrationInterface, QueryRunner } from 'typeorm';
import { SkillLevel } from '../common/enums/skill.enum';

export class AddSkillExpectedLevel1711455000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add expectedLevel column with default value
    await queryRunner.query(`
      ALTER TABLE skills
      ADD COLUMN expectedLevel ENUM('Beginner', 'Intermediate', 'Advanced') 
      NOT NULL DEFAULT 'Intermediate';
    `);

    // Update existing skills with random expected levels
    await queryRunner.query(`
      UPDATE skills
      SET expectedLevel = CASE 
        WHEN RAND() < 0.33 THEN 'Beginner'
        WHEN RAND() < 0.66 THEN 'Intermediate'
        ELSE 'Advanced'
      END;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE skills
      DROP COLUMN expectedLevel;
    `);
  }
} 