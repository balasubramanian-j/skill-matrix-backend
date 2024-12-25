import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSkillLevelToEnum1711440000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add temporary columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      ADD COLUMN temp_current_level VARCHAR(20),
      ADD COLUMN temp_expected_level VARCHAR(20);
    `);

    // Update temporary columns with string values
    await queryRunner.query(`
      UPDATE skill_assessments
      SET 
        temp_current_level = CASE
          WHEN currentLevel = 1 THEN 'Beginner'
          WHEN currentLevel = 2 THEN 'Intermediate'
          WHEN currentLevel = 3 THEN 'Advanced'
          ELSE 'Beginner'
        END,
        temp_expected_level = CASE
          WHEN expectedLevel = 1 THEN 'Beginner'
          WHEN expectedLevel = 2 THEN 'Intermediate'
          WHEN expectedLevel = 3 THEN 'Advanced'
          ELSE 'Intermediate'
        END;
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      DROP COLUMN currentLevel,
      DROP COLUMN expectedLevel;
    `);

    // Create new enum columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      ADD COLUMN currentLevel ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
      ADD COLUMN expectedLevel ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Intermediate';
    `);

    // Copy data from temporary columns
    await queryRunner.query(`
      UPDATE skill_assessments
      SET 
        currentLevel = temp_current_level,
        expectedLevel = temp_expected_level;
    `);

    // Drop temporary columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      DROP COLUMN temp_current_level,
      DROP COLUMN temp_expected_level;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add temporary columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      ADD COLUMN temp_current_level INT,
      ADD COLUMN temp_expected_level INT;
    `);

    // Convert enum values back to integers
    await queryRunner.query(`
      UPDATE skill_assessments
      SET 
        temp_current_level = CASE
          WHEN currentLevel = 'Beginner' THEN 1
          WHEN currentLevel = 'Intermediate' THEN 2
          WHEN currentLevel = 'Advanced' THEN 3
          ELSE 1
        END,
        temp_expected_level = CASE
          WHEN expectedLevel = 'Beginner' THEN 1
          WHEN expectedLevel = 'Intermediate' THEN 2
          WHEN expectedLevel = 'Advanced' THEN 3
          ELSE 2
        END;
    `);

    // Drop enum columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      DROP COLUMN currentLevel,
      DROP COLUMN expectedLevel;
    `);

    // Create new integer columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      ADD COLUMN currentLevel INT NOT NULL DEFAULT 1,
      ADD COLUMN expectedLevel INT NOT NULL DEFAULT 2;
    `);

    // Copy data from temporary columns
    await queryRunner.query(`
      UPDATE skill_assessments
      SET 
        currentLevel = temp_current_level,
        expectedLevel = temp_expected_level;
    `);

    // Drop temporary columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      DROP COLUMN temp_current_level,
      DROP COLUMN temp_expected_level;
    `);
  }
} 