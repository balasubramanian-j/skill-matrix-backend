import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationFilterDto, MarkReadDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  getUserNotifications(
    @GetUser('id') userId: string,
    @Query() filterDto: NotificationFilterDto
  ) {
    return this.notificationsService.getUserNotifications(userId, filterDto);
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  markAsRead(
    @GetUser('id') userId: string,
    @Body() markReadDto: MarkReadDto
  ) {
    return this.notificationsService.markAsRead(userId, markReadDto);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  getUnreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }
} 