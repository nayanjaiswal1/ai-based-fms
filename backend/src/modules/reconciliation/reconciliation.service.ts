import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  Reconciliation,
  ReconciliationStatus,
  ReconciliationTransaction,
  MatchConfidence,
  Transaction,
  Account,
  AccountReconciliationStatus,
} from '@database/entities';
import {
  StartReconciliationDto,
  UploadStatementDto,
  MatchTransactionDto,
  UnmatchTransactionDto,
  CompleteReconciliationDto,
  AdjustBalanceDto,
} from './dto';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(Reconciliation)
    private reconciliationRepository: Repository<Reconciliation>,
    @InjectRepository(ReconciliationTransaction)
    private reconciliationTransactionRepository: Repository<ReconciliationTransaction>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async startReconciliation(userId: string, dto: StartReconciliationDto): Promise<Reconciliation> {
    // Verify account ownership
    const account = await this.accountRepository.findOne({
      where: { id: dto.accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if there's already an in-progress reconciliation
    const existingReconciliation = await this.reconciliationRepository.findOne({
      where: {
        accountId: dto.accountId,
        userId,
        status: ReconciliationStatus.IN_PROGRESS,
      },
    });

    if (existingReconciliation) {
      throw new BadRequestException('An in-progress reconciliation already exists for this account');
    }

    // Update account status
    await this.accountRepository.update(dto.accountId, {
      reconciliationStatus: AccountReconciliationStatus.IN_PROGRESS,
    });

    // Create reconciliation
    const reconciliation = this.reconciliationRepository.create({
      accountId: dto.accountId,
      userId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      statementBalance: dto.statementBalance,
      notes: dto.notes,
      status: ReconciliationStatus.IN_PROGRESS,
    });

    return this.reconciliationRepository.save(reconciliation);
  }

  async uploadStatement(
    userId: string,
    reconciliationId: string,
    dto: UploadStatementDto,
  ): Promise<Reconciliation> {
    const reconciliation = await this.findReconciliationByIdAndUser(reconciliationId, userId);

    if (reconciliation.status !== ReconciliationStatus.IN_PROGRESS) {
      throw new BadRequestException('Reconciliation is not in progress');
    }

    // Get account transactions in the date range
    const accountTransactions = await this.transactionRepository.find({
      where: {
        accountId: reconciliation.accountId,
        userId,
        date: Between(reconciliation.startDate, reconciliation.endDate),
        isDeleted: false,
      },
      order: { date: 'ASC' },
    });

    // Create reconciliation transactions with automatic matching
    const reconciliationTransactions = await Promise.all(
      dto.transactions.map(async (stmtTx) => {
        const match = this.findBestMatch(stmtTx, accountTransactions);

        const recTx = this.reconciliationTransactionRepository.create({
          reconciliationId,
          statementAmount: stmtTx.amount,
          statementDate: new Date(stmtTx.date),
          statementDescription: stmtTx.description,
          statementReferenceNumber: stmtTx.referenceNumber,
          transactionId: match?.transaction?.id,
          matched: !!match?.transaction,
          matchConfidence: match?.confidence,
          confidenceScore: match?.score,
          isManualMatch: false,
          matchingDetails: match?.details,
        });

        return this.reconciliationTransactionRepository.save(recTx);
      }),
    );

    // Update reconciliation statistics
    const matchedCount = reconciliationTransactions.filter((rt) => rt.matched).length;
    const unmatchedCount = reconciliationTransactions.length - matchedCount;

    await this.reconciliationRepository.update(reconciliationId, {
      statementTransactionCount: dto.transactions.length,
      matchedCount,
      unmatchedCount,
    });

    return this.findReconciliationByIdAndUser(reconciliationId, userId);
  }

  private findBestMatch(
    statementTx: any,
    transactions: Transaction[],
  ): {
    transaction: Transaction | null;
    confidence: MatchConfidence;
    score: number;
    details: any;
  } | null {
    if (transactions.length === 0) {
      return null;
    }

    let bestMatch: Transaction | null = null;
    let bestScore = 0;
    let bestDetails: any = null;

    for (const tx of transactions) {
      const score = this.calculateMatchScore(statementTx, tx);

      if (score.total > bestScore) {
        bestScore = score.total;
        bestMatch = tx;
        bestDetails = score.details;
      }
    }

    // Only return match if score is above threshold (60%)
    if (bestScore < 60) {
      return null;
    }

    // Determine confidence level
    let confidence: MatchConfidence;
    if (bestScore === 100) {
      confidence = MatchConfidence.EXACT;
    } else if (bestScore >= 80) {
      confidence = MatchConfidence.HIGH;
    } else if (bestScore >= 60) {
      confidence = MatchConfidence.MEDIUM;
    } else {
      confidence = MatchConfidence.LOW;
    }

    return {
      transaction: bestMatch,
      confidence,
      score: bestScore,
      details: bestDetails,
    };
  }

  private calculateMatchScore(
    statementTx: any,
    transaction: Transaction,
  ): { total: number; details: any } {
    let totalScore = 0;
    const details: any = {
      amountMatch: false,
      dateMatch: false,
      descriptionSimilarity: 0,
      dateDifference: 0,
    };

    // Amount match (40 points)
    const txAmount = Math.abs(parseFloat(transaction.amount.toString()));
    const stmtAmount = Math.abs(statementTx.amount);

    if (Math.abs(txAmount - stmtAmount) < 0.01) {
      totalScore += 40;
      details.amountMatch = true;
    }

    // Date match (30 points)
    const txDate = new Date(transaction.date);
    const stmtDate = new Date(statementTx.date);
    const dateDiff = Math.abs(Math.floor((txDate.getTime() - stmtDate.getTime()) / (1000 * 60 * 60 * 24)));
    details.dateDifference = dateDiff;

    if (dateDiff === 0) {
      totalScore += 30;
      details.dateMatch = true;
    } else if (dateDiff === 1) {
      totalScore += 25;
    } else if (dateDiff === 2) {
      totalScore += 20;
    }

    // Description similarity (30 points)
    const similarity = this.calculateStringSimilarity(
      transaction.description.toLowerCase(),
      statementTx.description.toLowerCase(),
    );
    details.descriptionSimilarity = similarity;

    if (similarity > 0.8) {
      totalScore += 30;
    } else if (similarity > 0.6) {
      totalScore += 25;
    } else if (similarity > 0.4) {
      totalScore += 20;
    } else if (similarity > 0.2) {
      totalScore += 15;
    }

    return { total: totalScore, details };
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  async matchTransaction(
    userId: string,
    reconciliationId: string,
    dto: MatchTransactionDto,
  ): Promise<ReconciliationTransaction> {
    const reconciliation = await this.findReconciliationByIdAndUser(reconciliationId, userId);

    if (reconciliation.status !== ReconciliationStatus.IN_PROGRESS) {
      throw new BadRequestException('Reconciliation is not in progress');
    }

    // Verify transaction ownership
    const transaction = await this.transactionRepository.findOne({
      where: { id: dto.transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Update reconciliation transaction
    const recTx = await this.reconciliationTransactionRepository.findOne({
      where: { id: dto.reconciliationTransactionId, reconciliationId },
    });

    if (!recTx) {
      throw new NotFoundException('Reconciliation transaction not found');
    }

    recTx.transactionId = dto.transactionId;
    recTx.matched = true;
    recTx.isManualMatch = dto.isManual || true;
    recTx.matchConfidence = MatchConfidence.MANUAL;
    recTx.notes = dto.notes;

    await this.reconciliationTransactionRepository.save(recTx);

    // Update reconciliation stats
    await this.updateReconciliationStats(reconciliationId);

    return recTx;
  }

  async unmatchTransaction(
    userId: string,
    reconciliationId: string,
    dto: UnmatchTransactionDto,
  ): Promise<ReconciliationTransaction> {
    const reconciliation = await this.findReconciliationByIdAndUser(reconciliationId, userId);

    if (reconciliation.status !== ReconciliationStatus.IN_PROGRESS) {
      throw new BadRequestException('Reconciliation is not in progress');
    }

    const recTx = await this.reconciliationTransactionRepository.findOne({
      where: { id: dto.reconciliationTransactionId, reconciliationId },
    });

    if (!recTx) {
      throw new NotFoundException('Reconciliation transaction not found');
    }

    recTx.transactionId = null;
    recTx.matched = false;
    recTx.matchConfidence = null;
    recTx.isManualMatch = false;

    await this.reconciliationTransactionRepository.save(recTx);

    // Update reconciliation stats
    await this.updateReconciliationStats(reconciliationId);

    return recTx;
  }

  async completeReconciliation(
    userId: string,
    reconciliationId: string,
    dto: CompleteReconciliationDto,
  ): Promise<Reconciliation> {
    const reconciliation = await this.findReconciliationByIdAndUser(reconciliationId, userId);

    if (reconciliation.status !== ReconciliationStatus.IN_PROGRESS) {
      throw new BadRequestException('Reconciliation is not in progress');
    }

    // Calculate reconciled balance from matched transactions
    const matchedTransactions = await this.reconciliationTransactionRepository.find({
      where: { reconciliationId, matched: true },
      relations: ['transaction'],
    });

    const reconciledBalance = matchedTransactions.reduce((sum, rt) => {
      return sum + parseFloat(rt.statementAmount.toString());
    }, 0);

    const difference = Math.abs(reconciliation.statementBalance - reconciledBalance);

    // Update reconciliation
    reconciliation.status = ReconciliationStatus.COMPLETED;
    reconciliation.completedAt = new Date();
    reconciliation.reconciledBalance = reconciledBalance;
    reconciliation.difference = difference;
    reconciliation.notes = dto.notes || reconciliation.notes;
    reconciliation.summary = {
      totalMatched: reconciliation.matchedCount,
      totalUnmatched: reconciliation.unmatchedCount,
      discrepancyAmount: difference,
      adjustments: dto.adjustments || [],
    };

    await this.reconciliationRepository.save(reconciliation);

    // Update account status
    await this.accountRepository.update(reconciliation.accountId, {
      reconciliationStatus: AccountReconciliationStatus.RECONCILED,
      lastReconciledAt: new Date(),
      lastReconciledBalance: reconciledBalance,
    });

    return reconciliation;
  }

  async cancelReconciliation(userId: string, reconciliationId: string): Promise<void> {
    const reconciliation = await this.findReconciliationByIdAndUser(reconciliationId, userId);

    if (reconciliation.status !== ReconciliationStatus.IN_PROGRESS) {
      throw new BadRequestException('Reconciliation is not in progress');
    }

    reconciliation.status = ReconciliationStatus.CANCELLED;
    await this.reconciliationRepository.save(reconciliation);

    // Update account status
    await this.accountRepository.update(reconciliation.accountId, {
      reconciliationStatus: AccountReconciliationStatus.NONE,
    });
  }

  async getReconciliation(userId: string, reconciliationId: string): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: reconciliationId, userId },
      relations: ['account', 'reconciliationTransactions', 'reconciliationTransactions.transaction'],
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return reconciliation;
  }

  async getReconciliationHistory(userId: string, accountId: string): Promise<Reconciliation[]> {
    // Verify account ownership
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.reconciliationRepository.find({
      where: { accountId, userId },
      order: { createdAt: 'DESC' },
      relations: ['account'],
    });
  }

  async adjustBalance(
    userId: string,
    reconciliationId: string,
    dto: AdjustBalanceDto,
  ): Promise<Reconciliation> {
    const reconciliation = await this.findReconciliationByIdAndUser(reconciliationId, userId);

    if (reconciliation.status !== ReconciliationStatus.IN_PROGRESS) {
      throw new BadRequestException('Reconciliation is not in progress');
    }

    // Add adjustment to summary
    const currentSummary = reconciliation.summary || { adjustments: [] };
    const newAdjustment = {
      type: 'balance_adjustment',
      amount: dto.amount,
      reason: dto.reason,
      timestamp: new Date(),
    };

    currentSummary.adjustments = [...(currentSummary.adjustments || []), newAdjustment];
    reconciliation.summary = currentSummary;

    return this.reconciliationRepository.save(reconciliation);
  }

  private async updateReconciliationStats(reconciliationId: string): Promise<void> {
    const transactions = await this.reconciliationTransactionRepository.find({
      where: { reconciliationId },
    });

    const matchedCount = transactions.filter((rt) => rt.matched).length;
    const unmatchedCount = transactions.length - matchedCount;

    await this.reconciliationRepository.update(reconciliationId, {
      matchedCount,
      unmatchedCount,
    });
  }

  private async findReconciliationByIdAndUser(
    reconciliationId: string,
    userId: string,
  ): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: reconciliationId, userId },
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return reconciliation;
  }
}
