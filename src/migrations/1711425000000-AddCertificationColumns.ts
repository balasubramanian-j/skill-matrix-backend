import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCertificationColumns1711425000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First add the new columns
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      ADD COLUMN certificationName VARCHAR(255),
      ADD COLUMN certificationUrl VARCHAR(255);
    `);

    // Update existing records with sample certification data
    const assessments = await queryRunner.query(
      `SELECT id FROM skill_assessments WHERE status = 'completed'`
    );

    for (const assessment of assessments) {
      await queryRunner.query(`
        UPDATE skill_assessments
        SET 
          certificationName = 'Basic Certification',
          certificationUrl = 'https://example.com/cert'
        WHERE id = '${assessment.id}';
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns in reverse order
    await queryRunner.query(`
      ALTER TABLE skill_assessments
      DROP COLUMN certificationUrl,
      DROP COLUMN certificationName;
    `);
  }
} 