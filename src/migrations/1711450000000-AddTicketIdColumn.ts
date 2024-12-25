import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketIdColumn1711450000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add ticketId column
    await queryRunner.query(`
      ALTER TABLE help_desk_tickets
      ADD COLUMN ticketId VARCHAR(10) UNIQUE;
    `);

    // Get all existing tickets
    const tickets = await queryRunner.query(`
      SELECT id FROM help_desk_tickets ORDER BY createdAt ASC
    `);

    // Update existing tickets with generated ticketIds
    for (let i = 0; i < tickets.length; i++) {
      const ticketId = `SMH${(i + 1).toString().padStart(2, '0')}`;
      await queryRunner.query(`
        UPDATE help_desk_tickets
        SET ticketId = '${ticketId}'
        WHERE id = '${tickets[i].id}';
      `);
    }

    // Make ticketId NOT NULL after populating data
    await queryRunner.query(`
      ALTER TABLE help_desk_tickets
      MODIFY COLUMN ticketId VARCHAR(10) NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE help_desk_tickets
      DROP COLUMN ticketId;
    `);
  }
}