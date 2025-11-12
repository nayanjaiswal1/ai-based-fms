import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In } from 'typeorm';
import { Transaction } from '@database/entities';
import { AccountsService } from '../accounts/accounts.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@database/entities/audit-log.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private accountsService: AccountsService,
    private auditService: AuditService,
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

    // Store old values for audit log
    const oldValues = this.serializeTransaction(transaction);

    // Reverse old balance change
    const oldBalanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    await this.accountsService.updateBalance(transaction.accountId, -oldBalanceChange);

    Object.assign(transaction, { ...updateDto, updatedBy: userId });
    const updated = await this.transactionRepository.save(transaction);

    // Apply new balance change
    const newBalanceChange = updated.type === 'expense' ? -updated.amount : updated.amount;
    await this.accountsService.updateBalance(updated.accountId, newBalanceChange);

    // Create audit log
    const newValues = this.serializeTransaction(updated);
    await this.auditService.logTransactionChange(
      userId,
      AuditAction.UPDATE,
      updated.id,
      oldValues,
      newValues,
      `Updated transaction: ${updated.description || 'Untitled'}`,
    );

    return updated;
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
  async mergeTransactions(userId: string, primaryTransactionId: string, duplicateTransactionIds: string[]) {
    // Validate primary transaction
    const primaryTransaction = await this.transactionRepository.findOne({
      where: { id: primaryTransactionId, userId, isDeleted: false },
    });

    if (!primaryTransaction) {
      throw new NotFoundException('Primary transaction not found');
    }

    if (primaryTransaction.isMerged) {
      throw new BadRequestException('Cannot merge into an already merged transaction');
    }

    // Validate duplicate transactions
    const duplicateTransactions = await this.transactionRepository.find({
      where: {
        id: In(duplicateTransactionIds),
        userId,
        isDeleted: false,
      },
    });

    if (duplicateTransactions.length !== duplicateTransactionIds.length) {
      throw new BadRequestException('Some duplicate transactions not found or do not belong to user');
    }

    // Check if any duplicate is already merged
    const alreadyMerged = duplicateTransactions.find(t => t.isMerged);
    if (alreadyMerged) {
      throw new BadRequestException('Cannot merge already merged transactions');
    }

    // Mark duplicates as merged
    const now = new Date();
    for (const duplicate of duplicateTransactions) {
      duplicate.isMerged = true;
      duplicate.mergedIntoId = primaryTransactionId;
      duplicate.mergedAt = now;

      // Reverse balance change for merged transaction
      const balanceChange = duplicate.type === 'expense' ? -duplicate.amount : duplicate.amount;
      await this.accountsService.updateBalance(duplicate.accountId, -balanceChange);
    }

    await this.transactionRepository.save(duplicateTransactions);

    // Create audit log for each merged transaction
    for (const duplicate of duplicateTransactions) {
      await this.auditService.createAuditLog({
        userId,
        action: AuditAction.UPDATE,
        entityType: 'Transaction',
        entityId: duplicate.id,
        oldValues: this.serializeTransaction(duplicate),
        newValues: { ...this.serializeTransaction(duplicate), isMerged: true, mergedIntoId: primaryTransactionId },
        description: `Merged transaction into ${primaryTransaction.description || primaryTransactionId}`,
      });
    }

    // Return the primary transaction with merge info
    return {
      ...primaryTransaction,
      mergedCount: duplicateTransactionIds.length,
      mergedTransactionIds: duplicateTransactionIds,
    };
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
      (Date.now() - transaction.mergedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceMerge > 30) {
      throw new BadRequestException('Cannot unmerge transaction older than 30 days');
    }

    // Restore transaction
    transaction.isMerged = false;
    transaction.mergedIntoId = null;
    transaction.mergedAt = null;

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
      category: transaction.category ? {
        id: transaction.categoryId,
        name: transaction.category.name,
      } : { id: transaction.categoryId },
      account: transaction.account ? {
        id: transaction.accountId,
        name: transaction.account.name,
      } : { id: transaction.accountId },
      tags: transaction.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
      })) || [],
      notes: transaction.notes,
      location: transaction.location,
      receipt: transaction.receipt,
    };
  }
}
