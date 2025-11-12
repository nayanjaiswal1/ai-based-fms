import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Transaction,
  Budget,
  Account,
  Category,
  Investment,
  LendBorrow,
  Group,
} from '@database/entities';
import { DateRangeQueryDto, DateRangePreset } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(LendBorrow)
    private lendBorrowRepository: Repository<LendBorrow>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  /**
   * Get comprehensive financial overview for dashboard
   */
  async getFinancialOverview(userId: string, queryDto: DateRangeQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    const [
      transactions,
      accounts,
      budgets,
      investments,
      lendBorrowRecords,
    ] = await Promise.all([
      this.transactionRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
          isDeleted: false,
        },
      }),
      this.accountRepository.find({ where: { userId, isActive: true } }),
      this.budgetRepository.find({
        where: { userId, isActive: true },
      }),
      this.investmentRepository.find({ where: { userId, isActive: true } }),
      this.lendBorrowRepository.find({ where: { userId } }),
    ]);

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);

    const totalInvested = investments.reduce(
      (sum, i) => sum + Number(i.currentValue),
      0,
    );

    const lentAmount = lendBorrowRecords
      .filter(r => r.type === 'lend' && r.status !== 'settled')
      .reduce((sum, r) => sum + Number(r.amountRemaining), 0);

    const borrowedAmount = lendBorrowRecords
      .filter(r => r.type === 'borrow' && r.status !== 'settled')
      .reduce((sum, r) => sum + Number(r.amountRemaining), 0);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalIncome: Number(income.toFixed(2)),
        totalExpenses: Number(expenses.toFixed(2)),
        netCashFlow: Number((income - expenses).toFixed(2)),
        savingsRate: income > 0 ? Number((((income - expenses) / income) * 100).toFixed(2)) : 0,
      },
      accounts: {
        totalBalance: Number(totalBalance.toFixed(2)),
        count: accounts.length,
      },
      budgets: {
        totalBudgeted: Number(totalBudgeted.toFixed(2)),
        totalSpent: Number(totalSpent.toFixed(2)),
        remaining: Number((totalBudgeted - totalSpent).toFixed(2)),
        utilizationRate: totalBudgeted > 0 ? Number(((totalSpent / totalBudgeted) * 100).toFixed(2)) : 0,
      },
      investments: {
        totalValue: Number(totalInvested.toFixed(2)),
        count: investments.length,
      },
      lendBorrow: {
        totalLent: Number(lentAmount.toFixed(2)),
        totalBorrowed: Number(borrowedAmount.toFixed(2)),
        netPosition: Number((lentAmount - borrowedAmount).toFixed(2)),
      },
    };
  }

  /**
   * Get spending by category breakdown
   */
  async getSpendingByCategory(userId: string, queryDto: DateRangeQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 'expense' })
      .andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('transaction.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();

    // Group by category
    const categoryMap = new Map<string, { name: string; amount: number; count: number }>();

    for (const transaction of transactions) {
      const categoryId = transaction.categoryId || 'uncategorized';
      const categoryName = transaction.category?.name || 'Uncategorized';

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: categoryName,
          amount: 0,
          count: 0,
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.amount += Number(transaction.amount);
      category.count += 1;
    }

    const totalSpent = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0,
    );

    const categories = Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        categoryId: id !== 'uncategorized' ? id : null,
        categoryName: data.name,
        amount: Number(data.amount.toFixed(2)),
        transactionCount: data.count,
        percentage: totalSpent > 0 ? Number(((data.amount / totalSpent) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalSpent: Number(totalSpent.toFixed(2)),
      categories,
    };
  }

  /**
   * Get income sources breakdown
   */
  async getIncomeByCategory(userId: string, queryDto: DateRangeQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 'income' })
      .andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('transaction.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();

    const categoryMap = new Map<string, { name: string; amount: number; count: number }>();

    for (const transaction of transactions) {
      const categoryId = transaction.categoryId || 'uncategorized';
      const categoryName = transaction.category?.name || 'Uncategorized';

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: categoryName,
          amount: 0,
          count: 0,
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.amount += Number(transaction.amount);
      category.count += 1;
    }

    const totalIncome = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0,
    );

    const categories = Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        categoryId: id !== 'uncategorized' ? id : null,
        categoryName: data.name,
        amount: Number(data.amount.toFixed(2)),
        transactionCount: data.count,
        percentage: totalIncome > 0 ? Number(((data.amount / totalIncome) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalIncome: Number(totalIncome.toFixed(2)),
      categories,
    };
  }

  /**
   * Get monthly trends for the past N months
   */
  async getMonthlyTrends(userId: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
      order: { date: 'ASC' },
    });

    // Group by month
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }

      const month = monthlyData.get(monthKey);
      if (transaction.type === 'income') {
        month.income += Number(transaction.amount);
      } else if (transaction.type === 'expense') {
        month.expenses += Number(transaction.amount);
      }
    }

    const trends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: Number(data.income.toFixed(2)),
        expenses: Number(data.expenses.toFixed(2)),
        netCashFlow: Number((data.income - data.expenses).toFixed(2)),
        savingsRate: data.income > 0 ? Number((((data.income - data.expenses) / data.income) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      trends,
    };
  }

  /**
   * Get spending trends by category over time
   */
  async getCategoryTrends(userId: string, categoryId: string, months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        categoryId,
        date: Between(startDate, endDate),
        type: 'expense',
        isDeleted: false,
      },
      order: { date: 'ASC' },
    });

    const monthlyData = new Map<string, { amount: number; count: number }>();

    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { amount: 0, count: 0 });
      }

      const month = monthlyData.get(monthKey);
      month.amount += Number(transaction.amount);
      month.count += 1;
    }

    const trends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        amount: Number(data.amount.toFixed(2)),
        transactionCount: data.count,
        averagePerTransaction: data.count > 0 ? Number((data.amount / data.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      categoryId,
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      trends,
    };
  }

  /**
   * Get account balance trends
   */
  async getAccountTrends(userId: string, accountId: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        accountId,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
      order: { date: 'ASC' },
    });

    // Get account's initial balance (we'll need to calculate balance at start date)
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      return null;
    }

    // Calculate balance at each month end
    const monthlyBalances = new Map<string, number>();
    let runningBalance = Number(account.balance);

    // Start from current and work backwards
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    for (const transaction of sortedTransactions) {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Reverse the transaction effect to get historical balance
      if (transaction.type === 'income' || transaction.type === 'transfer_in') {
        runningBalance -= Number(transaction.amount);
      } else if (transaction.type === 'expense' || transaction.type === 'transfer_out') {
        runningBalance += Number(transaction.amount);
      }

      monthlyBalances.set(monthKey, runningBalance);
    }

    // Reconstruct forward
    const trends = [];
    let balance = monthlyBalances.get(Array.from(monthlyBalances.keys()).sort()[0]) || 0;

    for (const [month, _] of Array.from(monthlyBalances.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        const tMonth = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
        return tMonth === month;
      });

      for (const t of monthTransactions) {
        if (t.type === 'income' || t.type === 'transfer_in') {
          balance += Number(t.amount);
        } else if (t.type === 'expense' || t.type === 'transfer_out') {
          balance -= Number(t.amount);
        }
      }

      trends.push({
        month,
        balance: Number(balance.toFixed(2)),
      });
    }

    return {
      accountId,
      accountName: account.name,
      currentBalance: Number(account.balance.toFixed(2)),
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      trends,
    };
  }

  /**
   * Compare current period with previous period
   */
  async getComparison(userId: string, queryDto: DateRangeQueryDto) {
    const { startDate: currentStart, endDate: currentEnd } = this.getDateRange(queryDto);

    // Calculate previous period (same duration)
    const durationDays = Math.ceil(
      (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - durationDays);
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);

    const [currentTransactions, previousTransactions] = await Promise.all([
      this.transactionRepository.find({
        where: {
          userId,
          date: Between(currentStart, currentEnd),
          isDeleted: false,
        },
      }),
      this.transactionRepository.find({
        where: {
          userId,
          date: Between(previousStart, previousEnd),
          isDeleted: false,
        },
      }),
    ]);

    const currentIncome = currentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentExpenses = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousIncome = previousTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousExpenses = previousTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      currentPeriod: {
        startDate: currentStart.toISOString().split('T')[0],
        endDate: currentEnd.toISOString().split('T')[0],
        income: Number(currentIncome.toFixed(2)),
        expenses: Number(currentExpenses.toFixed(2)),
        netCashFlow: Number((currentIncome - currentExpenses).toFixed(2)),
        transactionCount: currentTransactions.length,
      },
      previousPeriod: {
        startDate: previousStart.toISOString().split('T')[0],
        endDate: previousEnd.toISOString().split('T')[0],
        income: Number(previousIncome.toFixed(2)),
        expenses: Number(previousExpenses.toFixed(2)),
        netCashFlow: Number((previousIncome - previousExpenses).toFixed(2)),
        transactionCount: previousTransactions.length,
      },
      changes: {
        income: {
          amount: Number((currentIncome - previousIncome).toFixed(2)),
          percentage: previousIncome > 0 ? Number((((currentIncome - previousIncome) / previousIncome) * 100).toFixed(2)) : 0,
        },
        expenses: {
          amount: Number((currentExpenses - previousExpenses).toFixed(2)),
          percentage: previousExpenses > 0 ? Number((((currentExpenses - previousExpenses) / previousExpenses) * 100).toFixed(2)) : 0,
        },
        netCashFlow: {
          amount: Number(((currentIncome - currentExpenses) - (previousIncome - previousExpenses)).toFixed(2)),
        },
        transactions: {
          count: currentTransactions.length - previousTransactions.length,
        },
      },
    };
  }

  /**
   * Helper to calculate date range from query
   */
  private getDateRange(queryDto: DateRangeQueryDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (queryDto.preset && queryDto.preset !== DateRangePreset.CUSTOM) {
      switch (queryDto.preset) {
        case DateRangePreset.THIS_MONTH:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case DateRangePreset.LAST_MONTH:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case DateRangePreset.THIS_QUARTER:
          const currentQuarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
          endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
          break;
        case DateRangePreset.LAST_QUARTER:
          const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
          startDate = new Date(now.getFullYear(), lastQuarter * 3, 1);
          endDate = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0);
          break;
        case DateRangePreset.THIS_YEAR:
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        case DateRangePreset.LAST_YEAR:
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        case DateRangePreset.LAST_30_DAYS:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case DateRangePreset.LAST_90_DAYS:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 90);
          endDate = now;
          break;
        case DateRangePreset.LAST_365_DAYS:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }
    } else {
      // Custom date range
      startDate = queryDto.startDate ? new Date(queryDto.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = queryDto.endDate ? new Date(queryDto.endDate) : now;
    }

    return { startDate, endDate };
  }
}
