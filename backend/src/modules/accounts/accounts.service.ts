import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account, Transaction } from '@database/entities';
import { encrypt, decrypt } from '@common/utils/encryption.util';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
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

  async findAll(userId: string, includeTemp = false) {
    const where: any = { userId, isActive: true };

    // By default, exclude temporary accounts unless explicitly requested
    if (!includeTemp) {
      where.isTemporary = false;
    }

    const accounts = await this.accountRepository.find({
      where,
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

  /**
   * Create a temporary account from email/statement parsing
   */
  async createTempAccount(
    userId: string,
    source: string,
    accountInfo: {
      name?: string;
      type?: string;
      accountNumber?: string;
      bankName?: string;
    },
  ): Promise<Account> {
    const tempAccount = this.accountRepository.create({
      userId,
      name: accountInfo.name || `Temp Account (${source})`,
      type: (accountInfo.type as any) || 'bank',
      balance: 0,
      isTemporary: true,
      tempAccountSource: source,
      accountNumber: accountInfo.accountNumber,
      bankName: accountInfo.bankName,
      description: `Temporary account created from ${source}. Please link to an existing account or convert to permanent.`,
    });

    const saved = await this.accountRepository.save(tempAccount);
    this.logger.log(`Created temporary account ${saved.id} from source: ${source}`);
    return saved;
  }

  /**
   * Link a temporary account to a real account and move all transactions
   */
  async linkTempAccount(
    userId: string,
    tempAccountId: string,
    targetAccountId: string,
  ): Promise<{ movedTransactions: number }> {
    return await this.dataSource.transaction(async (manager) => {
      // Verify temp account exists and belongs to user
      const tempAccount = await manager.findOne(Account, {
        where: { id: tempAccountId, userId, isTemporary: true },
      });

      if (!tempAccount) {
        throw new NotFoundException('Temporary account not found');
      }

      // Verify target account exists and belongs to user
      const targetAccount = await manager.findOne(Account, {
        where: { id: targetAccountId, userId },
      });

      if (!targetAccount) {
        throw new NotFoundException('Target account not found');
      }

      // Move all transactions from temp account to target account
      const result = await manager.update(
        Transaction,
        { accountId: tempAccountId },
        { accountId: targetAccountId },
      );

      const movedCount = result.affected || 0;

      // Mark temp account as linked and inactive
      tempAccount.linkedToAccountId = targetAccountId;
      tempAccount.isActive = false;
      await manager.save(tempAccount);

      this.logger.log(
        `Linked temp account ${tempAccountId} to ${targetAccountId}, moved ${movedCount} transactions`,
      );

      return { movedTransactions: movedCount };
    });
  }

  /**
   * Convert a temporary account to a permanent account
   */
  async convertTempToPermanent(userId: string, tempAccountId: string): Promise<Account> {
    const tempAccount = await this.accountRepository.findOne({
      where: { id: tempAccountId, userId, isTemporary: true },
    });

    if (!tempAccount) {
      throw new NotFoundException('Temporary account not found');
    }

    tempAccount.isTemporary = false;
    tempAccount.description = tempAccount.description?.replace(
      /Temporary account created from.*Please link to an existing account or convert to permanent\./,
      'Account converted from temporary to permanent.',
    );

    const saved = await this.accountRepository.save(tempAccount);
    this.logger.log(`Converted temporary account ${tempAccountId} to permanent`);
    return saved;
  }

  /**
   * Get all temporary accounts for a user
   */
  async getTempAccounts(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId, isTemporary: true, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}
