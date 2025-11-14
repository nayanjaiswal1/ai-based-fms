import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '@database/entities';
import { encrypt, decrypt } from '@common/utils/encryption.util';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, createDto: any) {
    const accountData = { ...createDto, userId };

    // Encrypt statement password if provided
    if (accountData.statementPassword) {
      accountData.statementPassword = encrypt(accountData.statementPassword);
    }

    const account = this.accountRepository.create(accountData);
    return this.accountRepository.save(account);
  }

  async findAll(userId: string) {
    const accounts = await this.accountRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    // Decrypt passwords for client (they will be re-encrypted when saving)
    return accounts.map(account => ({
      ...account,
      statementPassword: account.statementPassword ? decrypt(account.statementPassword) : null,
    }));
  }

  async findOne(id: string, userId: string) {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');

    // Decrypt password for client
    return {
      ...account,
      statementPassword: account.statementPassword ? decrypt(account.statementPassword) : null,
    };
  }

  async update(id: string, userId: string, updateDto: any) {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');

    const updateData = { ...updateDto };

    // Encrypt statement password if provided
    if (updateData.statementPassword) {
      updateData.statementPassword = encrypt(updateData.statementPassword);
    }

    Object.assign(account, updateData);
    return this.accountRepository.save(account);
  }

  async remove(id: string, userId: string) {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');

    account.isActive = false;
    return this.accountRepository.save(account);
  }

  async updateBalance(accountId: string, amount: number, userId?: string) {
    // If userId is provided, validate account belongs to user
    if (userId) {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, userId },
      });

      if (!account) {
        throw new ForbiddenException('Account not found or access denied');
      }
    }

    // Update balance atomically
    const result = await this.accountRepository.increment({ id: accountId }, 'balance', amount);

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to update balance');
    }

    // Log for audit
    this.logger.log(`Balance updated for account ${accountId}: ${amount > 0 ? '+' : ''}${amount}`);

    return result;
  }

  /**
   * Get saved statement password for an account
   */
  async getStatementPassword(accountId: string, userId: string): Promise<string | null> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
      select: ['id', 'statementPassword'],
    });

    if (!account || !account.statementPassword) {
      return null;
    }

    return decrypt(account.statementPassword);
  }

  /**
   * Save statement password for an account
   */
  async saveStatementPassword(accountId: string, userId: string, password: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account.statementPassword = password ? encrypt(password) : null;
    await this.accountRepository.save(account);

    this.logger.log(`Statement password ${password ? 'saved' : 'removed'} for account ${accountId}`);
  }
}
