import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '@database/entities';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, createDto: any) {
    const account = this.accountRepository.create({
      ...createDto,
      userId,
    });
    return this.accountRepository.save(account);
  }

  async findAll(userId: string) {
    return this.accountRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(id: string, userId: string, updateDto: any) {
    const account = await this.findOne(id, userId);
    Object.assign(account, updateDto);
    return this.accountRepository.save(account);
  }

  async remove(id: string, userId: string) {
    const account = await this.findOne(id, userId);
    account.isActive = false;
    return this.accountRepository.save(account);
  }

  async updateBalance(accountId: string, amount: number) {
    await this.accountRepository.increment({ id: accountId }, 'balance', amount);
  }
}
