import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { SkillAssessment } from '../entities/skill-assessment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SkillAssessment])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {} 