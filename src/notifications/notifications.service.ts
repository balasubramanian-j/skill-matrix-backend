import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { NotificationFilterDto, MarkReadDto } from './dto/notification.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepository.create({
      user,
      type,
      title,
      message,
      priority,
      metadata,
    });

    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: string,
    filterDto: NotificationFilterDto
  ): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.user.id = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (filterDto.type) {
      query.andWhere('notification.type = :type', { type: filterDto.type });
    }

    if (filterDto.priority) {
      query.andWhere('notification.priority = :priority', { priority: filterDto.priority });
    }

    if (filterDto.unreadOnly) {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return query.getMany();
  }

  async markAsRead(userId: string, markReadDto: MarkReadDto): Promise<void> {
    await this.notificationRepository.update({
      id: In(markReadDto.notificationIds),
      user: { id: userId }
    }, {
      isRead: true
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({
      user: { id: userId },
      isRead: false
    }, {
      isRead: true
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        user: { id: userId },
        isRead: false
      }
    });
  }

  // Event handlers for automatic notifications
  @OnEvent('employee.deactivated')
  async handleEmployeeDeactivation(payload: { employee: User, deactivationDetails: any }) {
    const managers = await this.userRepository.find({
      where: [
        { id: payload.employee.reportingManager?.id },
        { id: payload.employee.functionalManager?.id }
      ]
    });

    for (const manager of managers) {
      if (manager) {
        await this.createNotification(
          manager.id,
          NotificationType.EMPLOYEE_DEACTIVATION,
          'Employee Deactivated',
          `${payload.employee.employeeName} has been deactivated.`,
          NotificationPriority.HIGH,
          {
            employeeId: payload.employee.id,
            deactivationDetails: payload.deactivationDetails
          }
        );
      }
    }
  }

  @OnEvent('helpdesk.ticket.updated')
  async handleTicketUpdate(payload: { ticket: any, userId: string }) {
    await this.createNotification(
      payload.userId,
      NotificationType.HELPDESK_UPDATE,
      'Help Desk Ticket Updated',
      `Your ticket #${payload.ticket.id} has been updated.`,
      NotificationPriority.MEDIUM,
      { ticketId: payload.ticket.id }
    );
  }

  @OnEvent('skill.review.due')
  async handleSkillReviewDue(payload: { employee: User, skillId: string }) {
    await this.createNotification(
      payload.employee.id,
      NotificationType.SKILL_REVIEW,
      'Skill Review Due',
      'You have a pending skill review.',
      NotificationPriority.MEDIUM,
      { skillId: payload.skillId }
    );
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      isRead: true
    });
  }
} 