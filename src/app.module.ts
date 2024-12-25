import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommonModule } from './common/common.module';
import { SkillsModule } from './skills/skills.module';

// Import all entities
import { User } from './entities/user.entity';
import { Skill } from './entities/skill.entity';
import { SkillAssessment } from './entities/skill-assessment.entity';
import { HelpDeskTicket } from './entities/help-desk-ticket.entity';
import { Role } from './entities/role.entity';
import { Notification } from './entities/notification.entity';
import { CustomField } from './entities/custom-field.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
      logging: true,
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: true,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    AdminModule,
    DashboardModule,
    HelpdeskModule,
    SettingsModule,
    NotificationsModule,
    CommonModule,
    SkillsModule,
  ],
})
export class AppModule {}
