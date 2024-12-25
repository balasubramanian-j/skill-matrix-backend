import { MigrationInterface, QueryRunner } from 'typeorm';
import { SkillLevel } from '../common/enums/skill.enum';
import { AssessmentStatus } from '../entities/skill-assessment.entity';

export class SeedSkillAssessmentEnumData1711445000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all users with role 'employee'
    const employees = await queryRunner.query(`
      SELECT id FROM users WHERE role = 'employee'
    `);

    // Get all skills
    const skills = await queryRunner.query(`
      SELECT id FROM skills
    `);

    // Function to get random enum value
    const getRandomSkillLevel = () => {
      const levels = [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED];
      return levels[Math.floor(Math.random() * levels.length)];
    };

    // Function to get expected level (always same or higher than current)
    const getExpectedLevel = (currentLevel: SkillLevel) => {
      const levels = [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED];
      const currentIndex = levels.indexOf(currentLevel);
      const possibleLevels = levels.slice(currentIndex);
      return possibleLevels[Math.floor(Math.random() * possibleLevels.length)];
    };

    // Insert skill assessments for each employee and skill
    for (const employee of employees) {
      for (const skill of skills) {
        const currentLevel = getRandomSkillLevel();
        const expectedLevel = getExpectedLevel(currentLevel);

        await queryRunner.query(`
          INSERT INTO skill_assessments (
            id,
            userId,
            skillId,
            currentLevel,
            expectedLevel,
            status,
            feedback,
            certificationName,
            certificationUrl
          ) VALUES (
            UUID(),
            '${employee.id}',
            '${skill.id}',
            '${currentLevel}',
            '${expectedLevel}',
            '${AssessmentStatus.COMPLETED}',
            'Initial assessment completed with new enum values',
            CASE 
              WHEN ${Math.random()} > 0.5 
              THEN 'Sample Certification'
              ELSE NULL
            END,
            CASE 
              WHEN ${Math.random()} > 0.5 
              THEN 'https://example.com/cert'
              ELSE NULL
            END
          );
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clear all skill assessments
    await queryRunner.query(`
      DELETE FROM skill_assessments;
    `);
  }
} 