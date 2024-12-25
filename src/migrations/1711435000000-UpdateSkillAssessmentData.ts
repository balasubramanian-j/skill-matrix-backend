import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSkillAssessmentData1711435000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all skill assessments with their relationships
    const assessments = await queryRunner.query(`
      SELECT sa.id, sa.user_id, sa.skill_id
      FROM skill_assessments sa
      INNER JOIN users u ON sa.user_id = u.id
      INNER JOIN skills s ON sa.skill_id = s.id
    `);

    // Update each assessment with the correct relationship data
    for (const assessment of assessments) {
      await queryRunner.query(`
        UPDATE skill_assessments
        SET 
          userId = '${assessment.user_id}',
          skillId = '${assessment.skill_id}'
        WHERE id = '${assessment.id}'
      `);
    }

    // Verify the data migration
    const verifyCount = await queryRunner.query(`
      SELECT COUNT(*) as count
      FROM skill_assessments
      WHERE userId IS NULL OR skillId IS NULL
    `);

    if (verifyCount[0].count > 0) {
      throw new Error('Data migration failed: Some records have null foreign keys');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get all skill assessments with their relationships
    const assessments = await queryRunner.query(`
      SELECT sa.id, sa.userId, sa.skillId
      FROM skill_assessments sa
      INNER JOIN users u ON sa.userId = u.id
      INNER JOIN skills s ON sa.skillId = s.id
    `);

    // Restore the old relationship data
    for (const assessment of assessments) {
      await queryRunner.query(`
        UPDATE skill_assessments
        SET 
          user_id = '${assessment.userId}',
          skill_id = '${assessment.skillId}'
        WHERE id = '${assessment.id}'
      `);
    }
  }
} 