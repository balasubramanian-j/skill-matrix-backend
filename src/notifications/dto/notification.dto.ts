import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationType, NotificationPriority } from '../../entities/notification.entity';

export class NotificationFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  unreadOnly?: boolean;
}

export class MarkReadDto {
  @ApiProperty({ type: [String] })
  @IsUUID(undefined, { each: true })
  notificationIds: string[];
} 