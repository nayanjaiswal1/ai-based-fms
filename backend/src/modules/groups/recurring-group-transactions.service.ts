import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringGroupTransaction, RecurrenceFrequency, RecurrenceStatus, GroupMember, GroupTransaction } from '@database/entities';
import { CreateRecurringGroupTransactionDto, UpdateRecurringGroupTransactionDto } from './dto/recurring-group-transaction.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RecurringGroupTransactionsService {
  constructor(
    @InjectRepository(RecurringGroupTransaction)
    private recurringRepository: Repository<RecurringGroupTransaction>,
    @InjectRepository(GroupTransaction)
    private transactionRepository: Repository<GroupTransaction>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
  ) {}

  async create(groupId: string, userId: string, createDto: CreateRecurringGroupTransactionDto) {
    await this.checkMemberAccess(groupId, userId);

    // Validate splits
    const splitTotal = Object.values(createDto.splits).reduce((sum, amount) => sum + amount, 0);
    if (Math.abs(splitTotal - createDto.amount) > 0.01) {
      throw new BadRequestException('Split amounts must equal transaction amount');
    }

    const nextProcessDate = this.calculateNextProcessDate(new Date(createDto.startDate), createDto.frequency);

    const recurring = this.recurringRepository.create({
      ...createDto,
      groupId,
      createdBy: userId,
      nextProcessDate,
      lastProcessedDate: null,
      occurrencesCreated: 0,
    });

    return this.recurringRepository.save(recurring);
  }

  async findAll(groupId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    return this.recurringRepository.find({
      where: { groupId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const recurring = await this.recurringRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!recurring) {
      throw new NotFoundException('Recurring transaction not found');
    }

    await this.checkMemberAccess(recurring.groupId, userId);

    return recurring;
  }

  async update(id: string, userId: string, updateDto: UpdateRecurringGroupTransactionDto) {
    const recurring = await this.findOne(id, userId);

    Object.assign(recurring, { ...updateDto, updatedBy: userId });

    // Recalculate next process date if frequency changed
    if (updateDto.frequency && recurring.nextProcessDate) {
      recurring.nextProcessDate = this.calculateNextProcessDate(
        recurring.lastProcessedDate || new Date(recurring.startDate),
        recurring.frequency,
      );
    }

    return this.recurringRepository.save(recurring);
  }

  async remove(id: string, userId: string) {
    const recurring = await this.findOne(id, userId);
    recurring.isDeleted = true;
    await this.recurringRepository.save(recurring);
    return { success: true, message: 'Recurring transaction deleted successfully' };
  }

  async pause(id: string, userId: string) {
    const recurring = await this.findOne(id, userId);
    recurring.status = RecurrenceStatus.PAUSED;
    return this.recurringRepository.save(recurring);
  }

  async resume(id: string, userId: string) {
    const recurring = await this.findOne(id, userId);
    recurring.status = RecurrenceStatus.ACTIVE;
    return this.recurringRepository.save(recurring);
  }

  // Process recurring transactions every hour
  @Cron(CronExpression.EVERY_HOUR)
  async processRecurringTransactions() {
    const now = new Date();
    const dueRecurrings = await this.recurringRepository.find({
      where: {
        status: RecurrenceStatus.ACTIVE,
        isDeleted: false,
        nextProcessDate: LessThanOrEqual(now),
      },
    });

    for (const recurring of dueRecurrings) {
      try {
        // Check if max occurrences reached
        if (recurring.maxOccurrences && recurring.occurrencesCreated >= recurring.maxOccurrences) {
          recurring.status = RecurrenceStatus.COMPLETED;
          await this.recurringRepository.save(recurring);
          continue;
        }

        // Check if end date passed
        if (recurring.endDate && new Date(recurring.endDate) < now) {
          recurring.status = RecurrenceStatus.COMPLETED;
          await this.recurringRepository.save(recurring);
          continue;
        }

        // Create the transaction
        const transaction = this.transactionRepository.create({
          description: recurring.description,
          amount: recurring.amount,
          currency: recurring.currency,
          date: now,
          paidBy: recurring.paidBy,
          splitType: recurring.splitType,
          splits: recurring.splits,
          notes: recurring.notes,
          categoryId: recurring.categoryId,
          groupId: recurring.groupId,
          createdBy: recurring.createdBy,
          isSettlement: false,
        });

        await this.transactionRepository.save(transaction);

        // Update recurring record
        recurring.occurrencesCreated += 1;
        recurring.lastProcessedDate = now;
        recurring.nextProcessDate = this.calculateNextProcessDate(now, recurring.frequency);

        await this.recurringRepository.save(recurring);

        console.log(`✅ Processed recurring transaction ${recurring.id} for group ${recurring.groupId}`);
      } catch (error) {
        console.error(`❌ Failed to process recurring transaction ${recurring.id}:`, error);
      }
    }
  }

  private calculateNextProcessDate(currentDate: Date, frequency: RecurrenceFrequency): Date {
    const next = new Date(currentDate);

    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;
      case RecurrenceFrequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;
      case RecurrenceFrequency.BIWEEKLY:
        next.setDate(next.getDate() + 14);
        break;
      case RecurrenceFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case RecurrenceFrequency.QUARTERLY:
        next.setMonth(next.getMonth() + 3);
        break;
      case RecurrenceFrequency.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  private async checkMemberAccess(groupId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return member;
  }
}
