import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationStatus } from '@database/entities';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Budget Alert' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'You have exceeded 80% of your monthly budget' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.BUDGET_ALERT })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ example: { budgetId: 'uuid', percentage: 85 } })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ example: '/budgets/uuid' })
  @IsOptional()
  @IsString()
  link?: string;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({ enum: NotificationStatus })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}

export class MarkAsReadDto {
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsString({ each: true })
  notificationIds: string[];
}

export class NotificationPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  budgetAlerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  groupReminders?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  repaymentReminders?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  aiInsights?: boolean;
}
