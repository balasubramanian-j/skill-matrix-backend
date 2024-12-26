import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Skill } from '../entities/skill.entity';
import { SkillAssessment } from '../entities/skill-assessment.entity';
import { HelpDeskTicket } from '../entities/help-desk-ticket.entity';
import { Role } from '../entities/role.entity';
import { Notification } from '../entities/notification.entity';
import { CustomField } from '../entities/custom-field.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'skill_matrix',
  entities: [
    User,
    Skill,
    SkillAssessment,
    HelpDeskTicket,
    Role,
    Notification,
    CustomField
  ],
  synchronize: false,
  logging: false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
}; 