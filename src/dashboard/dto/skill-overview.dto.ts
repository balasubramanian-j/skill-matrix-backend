import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SkillLevel } from '../../common/enums/skill.enum';

export class SkillOverviewDto {
  @ApiProperty()
  @IsUUID()
  skillId: string;

  @ApiProperty()
  @IsString()
  skillName: string;

  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  currentLevel: SkillLevel;

  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  expectedLevel: SkillLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationUrl?: string;

  @ApiProperty()
  progressPercentage: number;
}

export class TeamSkillOverviewDto extends SkillOverviewDto {
  @ApiProperty()
  @IsString()
  employeeName: string;

  @ApiProperty()
  @IsString()
  employeeCode: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty()
  skillGap: number;
} 