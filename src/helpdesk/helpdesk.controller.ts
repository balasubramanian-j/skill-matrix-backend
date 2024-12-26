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
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Help Desk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('helpdesk')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new ticket' })
  createTicket(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.helpdeskService.createTicket(req.user.id, createTicketDto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get tickets based on role' })
  getTickets(@Request() req, @Query() filterDto: TicketFilterDto) {
    if (req.user.role === 'admin') {
      return this.helpdeskService.getAllTickets(filterDto);
    }
    return this.helpdeskService.getUserTickets(req.user.id, filterDto);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by id' })
  getTicket(@Request() req, @Param('id') id: string) {
    if (req.user.role === 'admin') {
      return this.helpdeskService.getTicketById(id);
    }
    return this.helpdeskService.getUserTicketById(req.user.id, id);
  }

  @Patch('tickets/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update ticket status and assign admin (Admin only)' })
  updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.helpdeskService.updateTicket(id, updateTicketDto, req.user.id);
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get helpdesk statistics (Admin only)' })
  getStats() {
    return this.helpdeskService.getTicketStats();
  }
} 