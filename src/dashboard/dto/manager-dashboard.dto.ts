import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../entities/help-desk-ticket.entity';

export class TeamSkillOverviewDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  employeeName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  skillName: string;

  @ApiProperty()
  currentLevel: number;

  @ApiProperty()
  expectedLevel: number;

  @ApiProperty()
  gap: number;
}

export class TeamTicketOverviewDto {
  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  employeeName: string;

  @ApiProperty()
  queryType: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  description: string;
}

export class UpdateSkillExpectationDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  skillId: string;

  @ApiProperty()
  expectedLevel: number;
} 