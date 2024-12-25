import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../entities/user.entity';
import { Skill } from '../entities/skill.entity';
import { SkillAssessment } from '../entities/skill-assessment.entity';
import { HelpDeskTicket } from '../entities/help-desk-ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Skill, SkillAssessment, HelpDeskTicket]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} 