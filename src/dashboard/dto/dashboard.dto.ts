import { ApiProperty } from '@nestjs/swagger';

export class SkillGapDto {
  @ApiProperty()
  employeeName: string;

  @ApiProperty()
  skillName: string;

  @ApiProperty()
  currentLevel: number;

  @ApiProperty()
  expectedLevel: number;

  @ApiProperty()
  gap: number;
}

export class DepartmentSkillsDto {
  @ApiProperty()
  department: string;

  @ApiProperty()
  skillName: string;

  @ApiProperty()
  averageLevel: number;

  @ApiProperty()
  expectedLevel: number;
} 