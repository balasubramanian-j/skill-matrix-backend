import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Skill } from './src/entities/skill.entity';
import { SkillAssessment } from './src/entities/skill-assessment.entity';
import { HelpDeskTicket } from './src/entities/help-desk-ticket.entity';
import { Role } from './src/entities/role.entity';
import { Notification } from './src/entities/notification.entity';
import { CustomField } from './src/entities/custom-field.entity';

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'skill_matrix',
  entities: [
    User,
    Skill,
    SkillAssessment,
    HelpDeskTicket,
    Role,
    Notification,
    CustomField
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
}); 