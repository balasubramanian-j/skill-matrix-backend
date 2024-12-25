import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Query, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HelpdeskService } from './helpdesk.service';
import { CreateTicketDto, UpdateTicketDto, TicketFilterDto } from './dto/helpdesk.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../admin/role.guard';
import { Roles } from '../admin/roles.decorator';

@ApiTags('Help Desk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('helpdesk')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create new help desk ticket' })
  async createTicket(
    @Request() req,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.helpdeskService.createTicket(req.user.id, createTicketDto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get filtered help desk tickets' })
  async getTickets(
    @Query() filterDto: TicketFilterDto,
    @Request() req,
  ) {
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    return this.helpdeskService.getTickets(filterDto, userId);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  async getTicketById(@Param('id') id: string) {
    return this.helpdeskService.getTicketById(id);
  }

  @Patch('tickets/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update ticket status or assign admin' })
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.helpdeskService.updateTicket(id, updateTicketDto, req.user.id);
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get help desk statistics' })
  async getStats() {
    return this.helpdeskService.getTicketStats();
  }
} 