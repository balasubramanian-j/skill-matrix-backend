import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SkillLevel } from '../../common/enums/skill.enum';

export class CreateSkillAssessmentDto {
  @ApiProperty()
  @IsUUID()
  skillId: string;

  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  currentLevel: SkillLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationUrl?: string;
}

export class UpdateSkillAssessmentDto {
  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  currentLevel: SkillLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationUrl?: string;
} 