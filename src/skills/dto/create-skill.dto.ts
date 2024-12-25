import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { SkillLevel } from '../../common/enums/skill.enum';

export class CreateSkillDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  @ApiProperty({ enum: SkillLevel })
  @IsEnum(SkillLevel)
  expectedLevel: SkillLevel;
} 