import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SkillLevel } from '../common/enums/skill.enum';
import { AssessmentStatus } from '../entities/skill-assessment.entity';
import { Gender } from '../entities/user.entity';

export class SeedUsersAndSkills1711460000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // const hashedPassword = await bcrypt.hash('password123', 10);

    // // Get the last employee code
    // const lastEmployeeResult = await queryRunner.query(`
    //   SELECT employeeCode FROM users 
    //   WHERE employeeCode REGEXP '^EMP[0-9]+$'
    //   ORDER BY CAST(SUBSTRING(employeeCode, 4) AS UNSIGNED) DESC 
    //   LIMIT 1
    // `);
    
    // let nextEmployeeNumber = 1000;
    // if (lastEmployeeResult.length > 0) {
    //   const lastNumber = parseInt(lastEmployeeResult[0].employeeCode.substring(3));
    //   nextEmployeeNumber = lastNumber + 1;
    // }

    // // Create Business Units with Departments
    // const businessUnits = {
    //   'Engineering': ['Frontend', 'Backend', 'DevOps', 'QA'],
    //   'Product': ['Design', 'Product Management', 'User Research'],
    //   'Operations': ['HR', 'Finance', 'Administration'],
    //   'Sales': ['Direct Sales', 'Channel Partners', 'Customer Success']
    // };

    // // Create Skills by Category
    // const skills = {
    //   'Technical': [
    //     { name: 'JavaScript', expectedLevel: SkillLevel.ADVANCED },
    //     { name: 'Python', expectedLevel: SkillLevel.INTERMEDIATE },
    //     { name: 'AWS', expectedLevel: SkillLevel.ADVANCED },
    //     { name: 'Docker', expectedLevel: SkillLevel.INTERMEDIATE },
    //     { name: 'React', expectedLevel: SkillLevel.ADVANCED }
    //   ],
    //   'Management': [
    //     { name: 'Project Management', expectedLevel: SkillLevel.ADVANCED },
    //     { name: 'Team Leadership', expectedLevel: SkillLevel.ADVANCED },
    //     { name: 'Agile Methodologies', expectedLevel: SkillLevel.INTERMEDIATE }
    //   ],
    //   'Soft Skills': [
    //     { name: 'Communication', expectedLevel: SkillLevel.ADVANCED },
    //     { name: 'Problem Solving', expectedLevel: SkillLevel.ADVANCED },
    //     { name: 'Time Management', expectedLevel: SkillLevel.INTERMEDIATE }
    //   ]
    // };

    // // Insert Skills
    // for (const category in skills) {
    //   for (const skill of skills[category]) {
    //     const existingSkill = await queryRunner.query(`SELECT * FROM skills WHERE name = '${skill.name}'`);
    //     if (existingSkill.length === 0) {
    //       await queryRunner.query(`
    //         INSERT INTO skills (id, name, category, expectedLevel)
    //         VALUES (UUID(), '${skill.name}', '${category}', '${skill.expectedLevel}')
    //       `);
    //     }
    //   }
    // }

    // // Create Users for each Business Unit and Department
    // for (const [businessUnit, departments] of Object.entries(businessUnits)) {
    //   // Create manager for business unit
    //   const managerResult = await queryRunner.query(`
    //     INSERT INTO users (
    //       id, employeeCode, password, employeeName, businessUnit, department,
    //       officialEmail, designation, gender, role, dateOfJoining, isActive
    //     ) VALUES (
    //       UUID(), 'EMP${nextEmployeeNumber}', '${hashedPassword}',
    //       '${businessUnit} Manager', '${businessUnit}', 'Management',
    //       'manager.${businessUnit.toLowerCase()}@example.com', 'Senior Manager',
    //       '${Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE}', 'manager',
    //       DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 365) DAY), true
    //     )
    //   `);
      
    //   const managerId = await queryRunner.query(
    //     'SELECT id FROM users WHERE employeeCode = ?', 
    //     [`EMP${nextEmployeeNumber}`]
    //   );
    //   nextEmployeeNumber++;

    //   for (const department of departments) {
    //     // Create team lead
    //     const teamLeadEmployeeCode = `EMP${nextEmployeeNumber}`;
    //     await queryRunner.query(`
    //       INSERT INTO users (
    //         id, employeeCode, password, employeeName, businessUnit, department,
    //         officialEmail, designation, gender, role, dateOfJoining, isActive,
    //         reportingManagerId
    //       ) VALUES (
    //         UUID(), '${teamLeadEmployeeCode}', '${hashedPassword}',
    //         '${department} Lead', '${businessUnit}', '${department}',
    //         'lead.${department.toLowerCase()}@example.com', 'Team Lead',
    //         '${Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE}', 'manager',
    //         DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 365) DAY), true,
    //         '${managerId[0].id}'
    //       )
    //     `);
        
    //     const teamLeadId = await queryRunner.query(
    //       'SELECT id FROM users WHERE employeeCode = ?', 
    //       [teamLeadEmployeeCode]
    //     );
    //     nextEmployeeNumber++;

    //     // Create 3-5 employees per department
    //     const numEmployees = Math.floor(Math.random() * 3) + 3;
    //     for (let i = 0; i < numEmployees; i++) {
    //       const employeeEmployeeCode = `EMP${nextEmployeeNumber}`;
    //       await queryRunner.query(`
    //         INSERT INTO users (
    //           id, employeeCode, password, employeeName, businessUnit, department,
    //           officialEmail, designation, gender, role, dateOfJoining, isActive,
    //           reportingManagerId
    //         ) VALUES (
    //           UUID(), '${employeeEmployeeCode}', '${hashedPassword}',
    //           '${department} Employee ${i + 1}', '${businessUnit}', '${department}',
    //           'emp${nextEmployeeNumber}@example.com', 'Associate',
    //           '${Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE}', 'employee',
    //           DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 365) DAY), true,
    //           '${teamLeadId[0].id}'
    //         )
    //       `);
          
    //       const employeeId = await queryRunner.query(
    //         'SELECT id FROM users WHERE employeeCode = ?', 
    //         [employeeEmployeeCode]
    //       );
    //       nextEmployeeNumber++;

    //       // Assign random skills to employee
    //       const allSkills = await queryRunner.query(`SELECT id FROM skills`);
    //       const numSkills = Math.floor(Math.random() * 5) + 3;
    //       const selectedSkills = allSkills.sort(() => 0.5 - Math.random()).slice(0, numSkills);

    //       for (const skill of selectedSkills) {
    //         await queryRunner.query(`
    //           INSERT INTO skill_assessments (
    //             id, userId, skillId, currentLevel, expectedLevel, status,
    //             certificationName, certificationUrl
    //           ) VALUES (
    //             UUID(),
    //             '${employeeId[0].id}',
    //             '${skill.id}',
    //             '${Object.values(SkillLevel)[Math.floor(Math.random() * 3)]}',
    //             '${Object.values(SkillLevel)[Math.floor(Math.random() * 3)]}',
    //             '${AssessmentStatus.COMPLETED}',
    //             ${Math.random() > 0.7 ? "'Sample Certification'" : 'NULL'},
    //             ${Math.random() > 0.7 ? "'https://example.com/cert'" : 'NULL'}
    //           )
    //         `);
    //       }
    //     }
    //   }
    // }

    // Update employee codes for today's inserted records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString().split('T')[0];
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndStr = todayEnd.toISOString().split('T')[0];

    // Create a temporary table to avoid the error
    await queryRunner.query(`
      UPDATE users
      SET employeeCode = CONCAT('EMP', LPAD(CAST(SUBSTRING_INDEX(employeeCode, 'EMP', -1) AS UNSIGNED) + 1, 3, '0'))
      WHERE date(createdAt) BETWEEN '${todayStart}' AND '${todayEndStr}'
      AND employeeCode NOT LIKE 'EMP0%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM skill_assessments');
    await queryRunner.query('DELETE FROM users WHERE role != "admin"');
    await queryRunner.query('DELETE FROM skills');
  }
} 