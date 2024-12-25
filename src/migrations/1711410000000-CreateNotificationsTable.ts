import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1711410000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notifications (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        userId CHAR(36) NOT NULL,
        type ENUM('skill_review', 'helpdesk_update', 'employee_movement', 'employee_deactivation', 'custom_field', 'system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        isRead BOOLEAN NOT NULL DEFAULT false,
        metadata JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Add index for faster queries
    await queryRunner.query(`
      CREATE INDEX idx_notifications_user_read 
      ON notifications(userId, isRead);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE notifications;`);
  }
} 