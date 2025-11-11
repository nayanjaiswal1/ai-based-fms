import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Transaction } from '@database/entities';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private accountsService: AccountsService,
  ) {}

  async create(userId: string, createDto: any) {
    const transaction = this.transactionRepository.create({
      ...createDto,
      userId,
      createdBy: userId,
    });

    const saved = await this.transactionRepository.save(transaction);

    // Update account balance
    const balanceChange = createDto.type === 'expense' ? -createDto.amount : createDto.amount;
    await this.accountsService.updateBalance(createDto.accountId, balanceChange);

    return saved;
  }

  async findAll(userId: string, filters?: any) {
    const where: FindOptionsWhere<Transaction> = {
      userId,
      isDeleted: false,
    };

    if (filters?.startDate && filters?.endDate) {
      where.date = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    if (filters?.type) where.type = filters.type;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.accountId) where.accountId = filters.accountId;

    return this.transactionRepository.find({
      where,
      relations: ['account', 'category', 'tags'],
      order: { date: 'DESC', createdAt: 'DESC' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId, isDeleted: false },
      relations: ['account', 'category', 'tags'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(id: string, userId: string, updateDto: any) {
    const transaction = await this.findOne(id, userId);

    // Reverse old balance change
    const oldBalanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    await this.accountsService.updateBalance(transaction.accountId, -oldBalanceChange);

    Object.assign(transaction, { ...updateDto, updatedBy: userId });
    const updated = await this.transactionRepository.save(transaction);

    // Apply new balance change
    const newBalanceChange = updated.type === 'expense' ? -updated.amount : updated.amount;
    await this.accountsService.updateBalance(updated.accountId, newBalanceChange);

    return updated;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // Reverse balance change
    const balanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    await this.accountsService.updateBalance(transaction.accountId, -balanceChange);

    transaction.isDeleted = true;
    return this.transactionRepository.save(transaction);
  }

  async getStats(userId: string, startDate: Date, endDate: Date) {
    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        isDeleted: false,
        date: Between(startDate, endDate),
      },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expense,
      savings: income - expense,
      transactionCount: transactions.length,
    };
  }
}
