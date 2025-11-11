import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Reminder, ReminderStatus } from '@database/entities';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
  ) {}

  async create(userId: string, createDto: CreateReminderDto) {
    const reminder = this.reminderRepository.create({
      ...createDto,
      userId,
    });

    return this.reminderRepository.save(reminder);
  }

  async findAll(userId: string, status?: ReminderStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.reminderRepository.find({
      where,
      order: { dueDate: 'ASC' },
    });
  }

  async findActive(userId: string) {
    return this.findAll(userId, ReminderStatus.ACTIVE);
  }

  async findOne(id: string, userId: string) {
    const reminder = await this.reminderRepository.findOne({
      where: { id, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async update(id: string, userId: string, updateDto: UpdateReminderDto) {
    const reminder = await this.findOne(id, userId);
    Object.assign(reminder, updateDto);
    return this.reminderRepository.save(reminder);
  }

  async remove(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);
    return this.reminderRepository.remove(reminder);
  }

  async markAsCompleted(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);
    reminder.status = ReminderStatus.COMPLETED;
    return this.reminderRepository.save(reminder);
  }

  async getUpcoming(userId: string, days: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.reminderRepository
      .createQueryBuilder('reminder')
      .where('reminder.userId = :userId', { userId })
      .andWhere('reminder.status = :status', { status: ReminderStatus.ACTIVE })
      .andWhere('reminder.dueDate BETWEEN :now AND :futureDate', { now, futureDate })
      .orderBy('reminder.dueDate', 'ASC')
      .getMany();
  }

  async getOverdue(userId: string) {
    const now = new Date();
    return this.reminderRepository
      .createQueryBuilder('reminder')
      .where('reminder.userId = :userId', { userId })
      .andWhere('reminder.status = :status', { status: ReminderStatus.ACTIVE })
      .andWhere('reminder.dueDate < :now', { now })
      .orderBy('reminder.dueDate', 'ASC')
      .getMany();
  }

  async getDueToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.reminderRepository
      .createQueryBuilder('reminder')
      .where('reminder.userId = :userId', { userId })
      .andWhere('reminder.status = :status', { status: ReminderStatus.ACTIVE })
      .andWhere('reminder.dueDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .orderBy('reminder.dueDate', 'ASC')
      .getMany();
  }

  // Method to find reminders that need notification
  async getRemindersDueForNotification() {
    const reminders = await this.reminderRepository
      .createQueryBuilder('reminder')
      .where('reminder.status = :status', { status: ReminderStatus.ACTIVE })
      .andWhere('reminder.notificationEnabled = :enabled', { enabled: true })
      .getMany();

    const now = new Date();
    const dueForNotification = [];

    for (const reminder of reminders) {
      const dueDate = new Date(reminder.dueDate);
      const notifyDate = new Date(dueDate);
      notifyDate.setDate(dueDate.getDate() - reminder.notifyDaysBefore);

      // Check if we should send notification today
      if (
        now.getFullYear() === notifyDate.getFullYear() &&
        now.getMonth() === notifyDate.getMonth() &&
        now.getDate() === notifyDate.getDate()
      ) {
        dueForNotification.push(reminder);
      }
    }

    return dueForNotification;
  }

  async getSummary(userId: string) {
    const [active, overdue, upcoming] = await Promise.all([
      this.findActive(userId),
      this.getOverdue(userId),
      this.getUpcoming(userId, 7),
    ]);

    return {
      totalActive: active.length,
      overdue: overdue.length,
      upcomingWeek: upcoming.length,
      byType: {
        bill: active.filter(r => r.type === 'bill').length,
        repayment: active.filter(r => r.type === 'repayment').length,
        goal: active.filter(r => r.type === 'goal').length,
        custom: active.filter(r => r.type === 'custom').length,
      },
    };
  }
}
