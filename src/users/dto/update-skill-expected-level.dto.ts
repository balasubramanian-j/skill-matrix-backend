import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SkillLevel } from '../../common/enums/skill.enum';

export class UpdateSkillExpectedLevelDto {
  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  expectedLevel: SkillLevel;
} 