import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permission } from '../entities/role.entity';

export class SeedDummyData1711420000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles first with permissions
    await queryRunner.query(`
      INSERT INTO roles (id, name, description, permissions) VALUES
      (UUID(), 'admin', 'Administrator role with full access', 
       JSON_ARRAY(
         '${Permission.CREATE_USER}',
         '${Permission.UPDATE_USER}',
         '${Permission.DELETE_USER}',
         '${Permission.VIEW_USER}',
         '${Permission.MANAGE_ROLES}',
         '${Permission.MANAGE_SKILLS}',
         '${Permission.VIEW_REPORTS}'
       )),
      (UUID(), 'manager', 'Manager role with team management access', 
       JSON_ARRAY(
         '${Permission.VIEW_USER}',
         '${Permission.UPDATE_USER}',
         '${Permission.MANAGE_SKILLS}',
         '${Permission.VIEW_REPORTS}'
       )),
      (UUID(), 'employee', 'Regular employee role', 
       JSON_ARRAY(
         '${Permission.VIEW_USER}'
       ));
    `);

    // Get role IDs
    const roles = await queryRunner.query(`SELECT id, name FROM roles`);
    const adminRoleId = roles.find(r => r.name === 'admin').id;
    const managerRoleId = roles.find(r => r.name === 'manager').id;
    const employeeRoleId = roles.find(r => r.name === 'employee').id;

    // Create admin user first
    const hashedPassword = await bcrypt.hash('password123', 10);
    await queryRunner.query(`
      INSERT INTO users (
        id, employeeCode, password, employeeName, businessUnit, department,
        officialEmail, designation, gender, role, dateOfJoining, isActive
      ) VALUES (
        UUID(), 'EMP001', '${hashedPassword}', 'Admin User', 'IT',
        'Administration', 'admin@example.com', 'System Administrator',
        'M', 'admin', '2024-01-01', true
      );
    `);

    // Get admin user ID
    const adminUser = await queryRunner.query(`
      SELECT id FROM users WHERE employeeCode = 'EMP001'
    `);
    const adminId = adminUser[0].id;

    // Create managers
    await queryRunner.query(`
      INSERT INTO users (
        id, employeeCode, password, employeeName, businessUnit, department,
        officialEmail, designation, gender, role, dateOfJoining, isActive,
        reportingManagerId
      ) VALUES
      (UUID(), 'EMP002', '${hashedPassword}', 'IT Manager', 'IT', 'Development',
       'it.manager@example.com', 'Development Manager', 'M', 'manager',
       '2024-01-01', true, '${adminId}'),
      (UUID(), 'EMP003', '${hashedPassword}', 'HR Manager', 'HR', 'Human Resources',
       'hr.manager@example.com', 'HR Manager', 'F', 'manager',
       '2024-01-01', true, '${adminId}');
    `);

    // Get manager IDs
    const managers = await queryRunner.query(`
      SELECT id, department FROM users WHERE role = 'manager'
    `);
    const itManagerId = managers.find(m => m.department === 'Development').id;
    const hrManagerId = managers.find(m => m.department === 'Human Resources').id;

    // Create employees
    await queryRunner.query(`
      INSERT INTO users (
        id, employeeCode, password, employeeName, businessUnit, department,
        officialEmail, designation, gender, role, dateOfJoining, isActive,
        reportingManagerId
      ) VALUES
      (UUID(), 'EMP004', '${hashedPassword}', 'Developer One', 'IT', 'Development',
       'dev1@example.com', 'Senior Developer', 'M', 'employee',
       '2024-01-15', true, '${itManagerId}'),
      (UUID(), 'EMP005', '${hashedPassword}', 'Developer Two', 'IT', 'Development',
       'dev2@example.com', 'Junior Developer', 'F', 'employee',
       '2024-01-15', true, '${itManagerId}'),
      (UUID(), 'EMP006', '${hashedPassword}', 'HR Executive', 'HR', 'Human Resources',
       'hr.exec@example.com', 'HR Executive', 'F', 'employee',
       '2024-01-15', true, '${hrManagerId}');
    `);

    // Assign roles to users
    const users = await queryRunner.query(`SELECT id, role FROM users`);
    for (const user of users) {
      let roleId;
      switch (user.role) {
        case 'admin':
          roleId = adminRoleId;
          break;
        case 'manager':
          roleId = managerRoleId;
          break;
        case 'employee':
          roleId = employeeRoleId;
          break;
      }
      await queryRunner.query(`
        INSERT INTO user_roles (userId, roleId)
        VALUES ('${user.id}', '${roleId}');
      `);
    }

    // Create skills
    await queryRunner.query(`
      INSERT INTO skills (id, name, description, category) VALUES
      (UUID(), 'JavaScript', 'JavaScript programming language', 'Technical'),
      (UUID(), 'Node.js', 'Node.js runtime environment', 'Technical'),
      (UUID(), 'Communication', 'Communication skills', 'Soft Skills'),
      (UUID(), 'Leadership', 'Leadership skills', 'Soft Skills');
    `);

    // Create skill assessments
    const skills = await queryRunner.query(`SELECT id FROM skills`);
    const developers = await queryRunner.query(`
      SELECT id FROM users WHERE department = 'Development' AND role = 'employee'
    `);

    for (const dev of developers) {
      for (const skill of skills) {
        await queryRunner.query(`
          INSERT INTO skill_assessments (
            id, userId, skillId, currentLevel, expectedLevel, status, feedback,
            certificationName, certificationUrl
          ) VALUES (
            UUID(), '${dev.id}', '${skill.id}',
            FLOOR(1 + RAND() * 4), 
            FLOOR(2 + RAND() * 3),
            'completed',
            'Initial assessment completed',
            'Basic Certification',
            'https://example.com/cert'
          );
        `);
      }
    }

    // Create help desk tickets
    const employees = await queryRunner.query(`
      SELECT id FROM users WHERE role = 'employee'
    `);

    for (const emp of employees) {
      await queryRunner.query(`
        INSERT INTO help_desk_tickets (
          id, queryType, description, priority, status, submittedById
        ) VALUES (
          UUID(), 'Technical Support', 'Need help with system access',
          'medium', 'open', '${emp.id}'
        );
      `);
    }

    // Create custom fields
    await queryRunner.query(`
      INSERT INTO custom_fields (
        id, name, type, defaultValue, required, visibility
      ) VALUES
      (UUID(), 'Emergency Contact', 'text', NULL, true, 'admin'),
      (UUID(), 'Skills Interest', 'select', NULL, false, 'manager');
    `);

    // Create notifications
    for (const user of users) {
      await queryRunner.query(`
        INSERT INTO notifications (
          id, userId, type, title, message, priority, isRead
        ) VALUES (
          UUID(), '${user.id}', 'system',
          'Welcome to Skill Matrix',
          'Welcome to the Skill Matrix system. Please complete your profile.',
          'medium', false
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clear all tables in reverse order to avoid foreign key constraints
    await queryRunner.query('DELETE FROM notifications');
    await queryRunner.query('DELETE FROM custom_fields');
    await queryRunner.query('DELETE FROM help_desk_tickets');
    await queryRunner.query('DELETE FROM skill_assessments');
    await queryRunner.query('DELETE FROM skills');
    await queryRunner.query('DELETE FROM user_roles');
    await queryRunner.query('DELETE FROM users');
    await queryRunner.query('DELETE FROM roles');
  }
} 