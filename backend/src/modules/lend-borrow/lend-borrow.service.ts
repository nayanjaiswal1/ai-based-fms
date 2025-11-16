import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LendBorrow, LendBorrowStatus } from '@database/entities';
import { CreateLendBorrowDto, UpdateLendBorrowDto, RecordPaymentDto } from './dto/lend-borrow.dto';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class LendBorrowService {
  constructor(
    @InjectRepository(LendBorrow)
    private lendBorrowRepository: Repository<LendBorrow>,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {}

  async create(userId: string, createDto: CreateLendBorrowDto) {
    const lendBorrow = this.lendBorrowRepository.create({
      ...createDto,
      userId,
    });

    return this.lendBorrowRepository.save(lendBorrow);
  }

  async findAll(userId: string, status?: LendBorrowStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.lendBorrowRepository.find({
      where,
      order: { date: 'DESC' },
    });
  }

  async findByType(userId: string, type: string) {
    return this.lendBorrowRepository.find({
      where: { userId, type: type as any },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const lendBorrow = await this.lendBorrowRepository.findOne({
      where: { id, userId },
    });

    if (!lendBorrow) {
      throw new NotFoundException('Record not found');
    }

    return lendBorrow;
  }

  async update(id: string, userId: string, updateDto: UpdateLendBorrowDto) {
    const lendBorrow = await this.findOne(id, userId);
    Object.assign(lendBorrow, updateDto);
    return this.lendBorrowRepository.save(lendBorrow);
  }

  async remove(id: string, userId: string) {
    const lendBorrow = await this.findOne(id, userId);
    return this.lendBorrowRepository.remove(lendBorrow);
  }

  async recordPayment(id: string, userId: string, paymentDto: RecordPaymentDto) {
    const lendBorrow = await this.findOne(id, userId);

    if (lendBorrow.status === LendBorrowStatus.SETTLED) {
      throw new BadRequestException('This record is already settled');
    }

    const amountRemaining = Number(lendBorrow.amount) - Number(lendBorrow.amountPaid);
    if (paymentDto.amount > amountRemaining) {
      throw new BadRequestException('Payment amount exceeds remaining amount');
    }

    lendBorrow.amountPaid = Number(lendBorrow.amountPaid) + Number(paymentDto.amount);

    // Update status
    const newAmountRemaining = Number(lendBorrow.amount) - Number(lendBorrow.amountPaid);
    if (newAmountRemaining <= 0) {
      lendBorrow.status = LendBorrowStatus.SETTLED;
      lendBorrow.amountPaid = lendBorrow.amount;
    } else if (lendBorrow.amountPaid > 0) {
      lendBorrow.status = LendBorrowStatus.PARTIAL;
    }

    return this.lendBorrowRepository.save(lendBorrow);
  }

  async markAsSettled(id: string, userId: string) {
    const lendBorrow = await this.findOne(id, userId);

    lendBorrow.amountPaid = lendBorrow.amount;
    lendBorrow.status = LendBorrowStatus.SETTLED;

    return this.lendBorrowRepository.save(lendBorrow);
  }

  async getSummary(userId: string) {
    const records = await this.findAll(userId);

    const lentRecords = records.filter((r) => r.type === 'lend');
    const borrowedRecords = records.filter((r) => r.type === 'borrow');

    const totalLent = lentRecords.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalLentOutstanding = lentRecords
      .filter((r) => r.status !== LendBorrowStatus.SETTLED)
      .reduce((sum, r) => sum + (Number(r.amount) - Number(r.amountPaid)), 0);

    const totalBorrowed = borrowedRecords.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalBorrowedOutstanding = borrowedRecords
      .filter((r) => r.status !== LendBorrowStatus.SETTLED)
      .reduce((sum, r) => sum + (Number(r.amount) - Number(r.amountPaid)), 0);

    return {
      lending: {
        total: Number(totalLent.toFixed(2)),
        outstanding: Number(totalLentOutstanding.toFixed(2)),
        settled: Number((totalLent - totalLentOutstanding).toFixed(2)),
        count: lentRecords.length,
        pendingCount: lentRecords.filter((r) => r.status === LendBorrowStatus.PENDING).length,
      },
      borrowing: {
        total: Number(totalBorrowed.toFixed(2)),
        outstanding: Number(totalBorrowedOutstanding.toFixed(2)),
        settled: Number((totalBorrowed - totalBorrowedOutstanding).toFixed(2)),
        count: borrowedRecords.length,
        pendingCount: borrowedRecords.filter((r) => r.status === LendBorrowStatus.PENDING).length,
      },
      netPosition: Number((totalLentOutstanding - totalBorrowedOutstanding).toFixed(2)),
    };
  }

  async getUpcomingDue(userId: string) {
    const now = new Date();
    const upcoming = await this.lendBorrowRepository
      .createQueryBuilder('lendBorrow')
      .where('lendBorrow.userId = :userId', { userId })
      .andWhere('lendBorrow.status != :status', { status: LendBorrowStatus.SETTLED })
      .andWhere('lendBorrow.dueDate IS NOT NULL')
      .andWhere('lendBorrow.dueDate >= :now', { now })
      .orderBy('lendBorrow.dueDate', 'ASC')
      .limit(10)
      .getMany();

    return upcoming.map((record) => ({
      id: record.id,
      type: record.type,
      personName: record.personName,
      amount: Number(record.amount) - Number(record.amountPaid),
      dueDate: record.dueDate,
      description: record.description,
      daysUntilDue: Math.ceil(
        (new Date(record.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  async getOverdue(userId: string) {
    const now = new Date();
    const overdue = await this.lendBorrowRepository
      .createQueryBuilder('lendBorrow')
      .where('lendBorrow.userId = :userId', { userId })
      .andWhere('lendBorrow.status != :status', { status: LendBorrowStatus.SETTLED })
      .andWhere('lendBorrow.dueDate IS NOT NULL')
      .andWhere('lendBorrow.dueDate < :now', { now })
      .orderBy('lendBorrow.dueDate', 'ASC')
      .getMany();

    return overdue.map((record) => ({
      id: record.id,
      type: record.type,
      personName: record.personName,
      amount: Number(record.amount) - Number(record.amountPaid),
      dueDate: record.dueDate,
      description: record.description,
      daysOverdue: Math.ceil(
        (now.getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  async convertToGroup(id: string, userId: string) {
    const lendBorrow = await this.findOne(id, userId);

    if (lendBorrow.convertedToGroup) {
      throw new BadRequestException('This record has already been converted to a group');
    }

    if (lendBorrow.status === LendBorrowStatus.SETTLED) {
      throw new BadRequestException('Cannot convert a settled record to a group');
    }

    // Create a 2-person group
    const groupName = lendBorrow.type === 'lend'
      ? `Lent to ${lendBorrow.personName}`
      : `Borrowed from ${lendBorrow.personName}`;

    const group = await this.groupsService.createWithExternalContact(userId, {
      name: groupName,
      description: lendBorrow.description || `Converted from ${lendBorrow.type} record`,
      currency: lendBorrow.currency,
      externalContact: {
        name: lendBorrow.personName,
        email: lendBorrow.personEmail,
        phone: lendBorrow.personPhone,
      },
      initialTransaction: {
        description: lendBorrow.description || `${lendBorrow.type === 'lend' ? 'Lent' : 'Borrowed'} amount`,
        amount: Number(lendBorrow.amount),
        date: lendBorrow.date,
        paidBy: lendBorrow.type === 'lend' ? userId : 'external',
        notes: lendBorrow.notes,
        attachments: lendBorrow.attachments,
      },
    });

    // Mark lend/borrow as converted
    lendBorrow.convertedToGroup = true;
    lendBorrow.groupId = group.id;
    await this.lendBorrowRepository.save(lendBorrow);

    return {
      success: true,
      groupId: group.id,
      message: 'Successfully converted to shared expense group',
    };
  }
}
