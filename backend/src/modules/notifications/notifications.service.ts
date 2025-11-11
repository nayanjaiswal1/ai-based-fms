import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from '@database/entities';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(userId: string, createDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      ...createDto,
      userId,
    });

    return this.notificationRepository.save(notification);
  }

  async findAll(userId: string, status?: NotificationStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, userId: string, updateDto: UpdateNotificationDto) {
    const notification = await this.findOne(id, userId);
    Object.assign(notification, updateDto);

    if (updateDto.status === NotificationStatus.READ && !notification.readAt) {
      notification.readAt = new Date();
    }

    return this.notificationRepository.save(notification);
  }

  async remove(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    return this.notificationRepository.remove(notification);
  }

  async markAsRead(notificationIds: string[], userId: string) {
    const notifications = await this.notificationRepository.find({
      where: notificationIds.map(id => ({ id, userId })),
    });

    notifications.forEach(notification => {
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
    });

    return this.notificationRepository.save(notifications);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date(),
      })
      .where('userId = :userId', { userId })
      .andWhere('status = :status', { status: NotificationStatus.UNREAD })
      .execute();

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async deleteAll(userId: string) {
    await this.notificationRepository.delete({ userId });
    return { message: 'All notifications deleted' };
  }

  // Helper method to create budget alert notifications
  async createBudgetAlert(
    userId: string,
    budgetId: string,
    budgetName: string,
    percentage: number,
  ) {
    return this.create(userId, {
      title: 'Budget Alert',
      message: `You have reached ${percentage}% of your "${budgetName}" budget`,
      type: NotificationType.BUDGET_ALERT,
      data: { budgetId, percentage },
      link: `/budgets/${budgetId}`,
    });
  }

  // Helper method to create repayment due notifications
  async createRepaymentDueAlert(
    userId: string,
    lendBorrowId: string,
    personName: string,
    amount: number,
    daysUntilDue: number,
  ) {
    return this.create(userId, {
      title: 'Payment Due Soon',
      message: `Payment to ${personName} of $${amount} is due in ${daysUntilDue} day(s)`,
      type: NotificationType.DUE_REPAYMENT,
      data: { lendBorrowId, personName, amount, daysUntilDue },
      link: `/lend-borrow/${lendBorrowId}`,
    });
  }

  // Helper method to create group settlement notifications
  async createGroupSettlementAlert(
    userId: string,
    groupId: string,
    groupName: string,
    amount: number,
  ) {
    return this.create(userId, {
      title: 'Group Settlement Required',
      message: `You owe $${amount} in group "${groupName}"`,
      type: NotificationType.GROUP_SETTLEMENT,
      data: { groupId, groupName, amount },
      link: `/groups/${groupId}`,
    });
  }
}
