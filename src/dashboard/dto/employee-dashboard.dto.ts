import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../entities/help-desk-ticket.entity';
import { SkillLevel } from '../../common/enums/skill.enum';

export class SkillOverviewDto {
  @ApiProperty()
  skillName: string;

  @ApiProperty({ enum: SkillLevel })
  currentLevel: SkillLevel;

  @ApiProperty({ enum: SkillLevel })
  expectedLevel: SkillLevel;

  @ApiProperty({ required: false })
  certificationName?: string;

  @ApiProperty({ required: false })
  certificationUrl?: string;

  @ApiProperty()
  progressPercentage: number;
}

export class TicketOverviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  queryType: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  createdAt: Date;
} 