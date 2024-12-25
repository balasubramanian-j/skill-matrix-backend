import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { CustomField } from '../entities/custom-field.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomField, User]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {} 