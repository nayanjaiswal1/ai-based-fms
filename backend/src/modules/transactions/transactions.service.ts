import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In, DataSource } from 'typeorm';
import { Transaction, Account, TransactionLineItem, TransactionSourceType } from '@database/entities';
import { AccountsService } from '../accounts/accounts.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@database/entities/audit-log.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionLineItem)
    private lineItemRepository: Repository<TransactionLineItem>,
    private accountsService: AccountsService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createDto: any): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      // Calculate total amount from line items if provided
      const totalAmount = createDto.lineItems?.length
        ? createDto.lineItems.reduce((sum: number, item: any) => sum + Number(item.amount), 0)
        : createDto.amount;

      const transaction = manager.create(Transaction, {
        ...createDto,
        amount: totalAmount,
        userId,
        createdBy: userId,
        sourceType: createDto.sourceType || TransactionSourceType.MANUAL,
        sourceId: createDto.sourceId || null,
      } as unknown as Transaction);

      const saved = await manager.save(transaction);

      // Create line items if provided
      if (createDto.lineItems?.length) {
        const lineItems = createDto.lineItems.map((item: any, index: number) =>
          manager.create(TransactionLineItem, {
            transactionId: saved.id,
            categoryId: item.categoryId,
            description: item.description,
            amount: item.amount,
            sortOrder: index,
          }),
        );
        await manager.save(lineItems);
      }

      // Update account balance
      const balanceChange = createDto.type === 'expense' ? -totalAmount : totalAmount;
      await this.accountsService.updateBalance(createDto.accountId, balanceChange);

      // Create audit log
      await this.auditService.logTransactionChange(
        userId,
        AuditAction.CREATE,
        saved.id,
        null,
        this.serializeTransaction(saved),
        `Created transaction: ${saved.description || 'Untitled'}`,
      );

      return saved;
    });
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

    const MAX_LIMIT = 1000;
    const DEFAULT_LIMIT = 50;

    return this.transactionRepository.find({
      where,
      relations: ['account', 'category', 'tags', 'lineItems', 'lineItems.category'],
      order: { date: 'DESC', createdAt: 'DESC' },
      take: Math.min(filters?.limit || DEFAULT_LIMIT, MAX_LIMIT),
      skip: filters?.offset || 0,
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId, isDeleted: false },
      relations: ['account', 'category', 'tags', 'lineItems', 'lineItems.category'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async getTransactionSource(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    if (!transaction.sourceType || transaction.sourceType === TransactionSourceType.MANUAL) {
      return {
        sourceType: TransactionSourceType.MANUAL,
        sourceId: null,
        navigationUrl: null,
      };
    }

    const navigationMap = {
      [TransactionSourceType.INVESTMENT]: `/investments/${transaction.sourceId}`,
      [TransactionSourceType.SHARED_EXPENSE]: `/shared-expenses/${transaction.sourceId}`,
      [TransactionSourceType.RECURRING]: `/recurring/${transaction.sourceId}`,
    };

    return {
      sourceType: transaction.sourceType,
      sourceId: transaction.sourceId,
      navigationUrl: navigationMap[transaction.sourceType] || null,
    };
  }

  async update(id: string, userId: string, updateDto: any) {
    return await this.dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const accountRepo = manager.getRepository(Account);

      // Find transaction with pessimistic lock
      const transaction = await transactionRepo.findOne({
        where: { id, userId, isDeleted: false },
        relations: ['account', 'category', 'tags'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Store old values for audit log
      const oldValues = this.serializeTransaction(transaction);

      // Calculate balance changes atomically
      const oldBalanceChange =
        transaction.type === 'expense' ? -transaction.amount : transaction.amount;
      const newAmount = updateDto.amount !== undefined ? updateDto.amount : transaction.amount;
      const newType = updateDto.type !== undefined ? updateDto.type : transaction.type;
      const newBalanceChange = newType === 'expense' ? -newAmount : newAmount;
      const balanceDelta = newBalanceChange - oldBalanceChange;

      // Handle account changes
      const newAccountId =
        updateDto.accountId !== undefined ? updateDto.accountId : transaction.accountId;

      if (newAccountId !== transaction.accountId) {
        // Moving to different account: reverse from old, apply to new
        await accountRepo.increment({ id: transaction.accountId }, 'balance', -oldBalanceChange);
        await accountRepo.increment({ id: newAccountId }, 'balance', newBalanceChange);
      } else {
        // Same account: apply delta
        if (balanceDelta !== 0) {
          await accountRepo.increment({ id: transaction.accountId }, 'balance', balanceDelta);
        }
      }

      // Update transaction
      Object.assign(transaction, { ...updateDto, updatedBy: userId });
      const updated = await transactionRepo.save(transaction);

      // Create audit log (outside transaction to avoid deadlocks)
      const newValues = this.serializeTransaction(updated);
      // Note: Audit log will be created after transaction commits
      setImmediate(async () => {
        await this.auditService.logTransactionChange(
          userId,
          AuditAction.UPDATE,
          updated.id,
          oldValues,
          newValues,
          `Updated transaction: ${updated.description || 'Untitled'}`,
        );
      });

      return updated;
    });
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // Store old values for audit log
    const oldValues = this.serializeTransaction(transaction);

    // Reverse balance change
    const balanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    await this.accountsService.updateBalance(transaction.accountId, -balanceChange);

    transaction.isDeleted = true;
    const deleted = await this.transactionRepository.save(transaction);

    // Create audit log
    await this.auditService.logTransactionChange(
      userId,
      AuditAction.DELETE,
      deleted.id,
      oldValues,
      null,
      `Deleted transaction: ${transaction.description || 'Untitled'}`,
    );

    return deleted;
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

  /**
   * Merge duplicate transactions
   */
  async mergeTransactions(
    userId: string,
    primaryTransactionId: string,
    duplicateTransactionIds: string[],
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const accountRepo = manager.getRepository(Account);

      // Validate primary transaction
      const primaryTransaction = await transactionRepo.findOne({
        where: { id: primaryTransactionId, userId, isDeleted: false },
      });

      if (!primaryTransaction) {
        throw new NotFoundException('Primary transaction not found');
      }

      if (primaryTransaction.isMerged) {
        throw new BadRequestException('Cannot merge into an already merged transaction');
      }

      // Validate duplicate transactions
      const duplicateTransactions = await transactionRepo.find({
        where: {
          id: In(duplicateTransactionIds),
          userId,
          isDeleted: false,
        },
      });

      if (duplicateTransactions.length !== duplicateTransactionIds.length) {
        throw new BadRequestException(
          'Some duplicate transactions not found or do not belong to user',
        );
      }

      // Check if any duplicate is already merged
      const alreadyMerged = duplicateTransactions.find((t) => t.isMerged);
      if (alreadyMerged) {
        throw new BadRequestException('Cannot merge already merged transactions');
      }

      // Mark duplicates as merged and reverse balances atomically
      const now = new Date();
      for (const duplicate of duplicateTransactions) {
        duplicate.isMerged = true;
        duplicate.mergedIntoId = primaryTransactionId;
        duplicate.mergedAt = now;

        // Reverse balance change for merged transaction atomically
        const balanceChange = duplicate.type === 'expense' ? -duplicate.amount : duplicate.amount;
        await accountRepo.increment({ id: duplicate.accountId }, 'balance', -balanceChange);
      }

      await transactionRepo.save(duplicateTransactions);

      // Create audit logs after transaction commits
      setImmediate(async () => {
        for (const duplicate of duplicateTransactions) {
          await this.auditService.createAuditLog({
            userId,
            action: AuditAction.UPDATE,
            entityType: 'Transaction',
            entityId: duplicate.id,
            oldValues: this.serializeTransaction(duplicate),
            newValues: {
              ...this.serializeTransaction(duplicate),
              isMerged: true,
              mergedIntoId: primaryTransactionId,
            },
            description: `Merged transaction into ${primaryTransaction.description || primaryTransactionId}`,
          });
        }
      });

      // Return the primary transaction with merge info
      return {
        ...primaryTransaction,
        mergedCount: duplicateTransactionIds.length,
        mergedTransactionIds: duplicateTransactionIds,
      };
    });
  }

  /**
   * Unmerge a previously merged transaction
   */
  async unmergeTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId, isDeleted: false },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.isMerged) {
      throw new BadRequestException('Transaction is not merged');
    }

    // Check if merge was within last 30 days (safety measure)
    const daysSinceMerge = Math.floor(
      (Date.now() - transaction.mergedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceMerge > 30) {
      throw new BadRequestException('Cannot unmerge transaction older than 30 days');
    }

    // Restore transaction
    transaction.isMerged = false;
    transaction.mergedIntoId = undefined;
    transaction.mergedAt = undefined;

    // Restore balance
    const balanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    await this.accountsService.updateBalance(transaction.accountId, balanceChange);

    const restored = await this.transactionRepository.save(transaction);

    // Create audit log
    await this.auditService.createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Transaction',
      entityId: restored.id,
      oldValues: { isMerged: true, mergedIntoId: transaction.mergedIntoId },
      newValues: { isMerged: false, mergedIntoId: null },
      description: `Unmerged transaction: ${transaction.description || 'Untitled'}`,
    });

    return restored;
  }

  /**
   * Mark two transactions as not duplicates (add to exclusion list)
   */
  async markAsNotDuplicate(userId: string, transactionId: string, comparedWithId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId, isDeleted: false },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const comparedWith = await this.transactionRepository.findOne({
      where: { id: comparedWithId, userId, isDeleted: false },
    });

    if (!comparedWith) {
      throw new NotFoundException('Compared transaction not found');
    }

    // Add to exclusion list for both transactions
    if (!transaction.duplicateExclusions) {
      transaction.duplicateExclusions = [];
    }
    if (!transaction.duplicateExclusions.includes(comparedWithId)) {
      transaction.duplicateExclusions.push(comparedWithId);
    }

    if (!comparedWith.duplicateExclusions) {
      comparedWith.duplicateExclusions = [];
    }
    if (!comparedWith.duplicateExclusions.includes(transactionId)) {
      comparedWith.duplicateExclusions.push(transactionId);
    }

    await this.transactionRepository.save([transaction, comparedWith]);

    return { success: true, message: 'Transactions marked as not duplicates' };
  }

  /**
   * Get merged transactions for a primary transaction
   */
  async getMergedTransactions(userId: string, primaryTransactionId: string) {
    const mergedTransactions = await this.transactionRepository.find({
      where: {
        userId,
        mergedIntoId: primaryTransactionId,
        isDeleted: false,
      },
      relations: ['account', 'category'],
    });

    return mergedTransactions;
  }

  /**
   * Serialize transaction for audit logging
   * Extracts relevant fields and formats relations
   */
  private serializeTransaction(transaction: Transaction): Record<string, any> {
    return {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      category: transaction.category
        ? {
            id: transaction.categoryId,
            name: transaction.category.name,
          }
        : { id: transaction.categoryId },
      account: transaction.account
        ? {
            id: transaction.accountId,
            name: transaction.account.name,
          }
        : { id: transaction.accountId },
      tags:
        transaction.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) || [],
      notes: transaction.notes,
      location: transaction.location,
    };
  }
}
