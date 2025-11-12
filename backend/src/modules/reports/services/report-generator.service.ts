import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Transaction } from '@database/entities/transaction.entity';
import { Budget } from '@database/entities/budget.entity';
import { Investment } from '@database/entities/investment.entity';
import { Account } from '@database/entities/account.entity';
import { GroupTransaction } from '@database/entities/group-transaction.entity';
import { LendBorrow } from '@database/entities/lend-borrow.entity';
import { Report, ReportConfig, ReportDataSource, ReportMetric } from '@database/entities/report.entity';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, subQuarters, startOfQuarter, endOfQuarter } from 'date-fns';

interface ReportData {
  summary: Record<string, any>;
  details: any[];
  charts?: any[];
  metadata: {
    generatedAt: Date;
    dataRange: { start: Date; end: Date };
    recordCount: number;
  };
}

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(GroupTransaction)
    private groupTransactionRepository: Repository<GroupTransaction>,
    @InjectRepository(LendBorrow)
    private lendBorrowRepository: Repository<LendBorrow>,
  ) {}

  async generateReportData(report: Report, userId: string): Promise<ReportData> {
    this.logger.log(`Generating report data for report ${report.id}, type: ${report.type}`);

    const config = report.config;
    const dateRange = this.getDateRange(config);

    let reportData: ReportData;

    switch (report.type) {
      case 'monthly_summary':
        reportData = await this.generateMonthlySummary(userId, config, dateRange);
        break;
      case 'tax_report':
        reportData = await this.generateTaxReport(userId, config, dateRange);
        break;
      case 'year_over_year':
        reportData = await this.generateYearOverYearReport(userId, config, dateRange);
        break;
      case 'month_over_month':
        reportData = await this.generateMonthOverMonthReport(userId, config, dateRange);
        break;
      case 'quarter_over_quarter':
        reportData = await this.generateQuarterOverQuarterReport(userId, config, dateRange);
        break;
      case 'budget_vs_actual':
        reportData = await this.generateBudgetVsActualReport(userId, config, dateRange);
        break;
      case 'category_spending':
        reportData = await this.generateCategorySpendingReport(userId, config, dateRange);
        break;
      case 'investment_performance':
        reportData = await this.generateInvestmentPerformanceReport(userId, config, dateRange);
        break;
      case 'group_expense_settlement':
        reportData = await this.generateGroupExpenseSettlementReport(userId, config, dateRange);
        break;
      case 'cash_flow':
        reportData = await this.generateCashFlowReport(userId, config, dateRange);
        break;
      case 'net_worth':
        reportData = await this.generateNetWorthReport(userId, config, dateRange);
        break;
      case 'profit_loss':
        reportData = await this.generateProfitLossReport(userId, config, dateRange);
        break;
      case 'custom':
        reportData = await this.generateCustomReport(userId, config, dateRange);
        break;
      default:
        throw new Error(`Unknown report type: ${report.type}`);
    }

    return reportData;
  }

  private getDateRange(config: ReportConfig): { start: Date; end: Date } {
    if (config.filters?.dateRange) {
      return {
        start: new Date(config.filters.dateRange.start),
        end: new Date(config.filters.dateRange.end),
      };
    }

    // Default to current month
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  }

  private async generateMonthlySummary(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const transactions = await this.getTransactions(userId, config, dateRange);

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown = this.groupByCategory(transactions.filter((t) => t.type === 'expense'));

    return {
      summary: {
        income,
        expenses,
        netSavings: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        transactionCount: transactions.length,
      },
      details: categoryBreakdown,
      charts: [
        {
          type: 'pie',
          title: 'Expenses by Category',
          data: categoryBreakdown,
        },
        {
          type: 'bar',
          title: 'Income vs Expenses',
          data: [
            { label: 'Income', value: income },
            { label: 'Expenses', value: expenses },
          ],
        },
      ],
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: transactions.length,
      },
    };
  }

  private async generateTaxReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const transactions = await this.getTransactions(userId, config, dateRange);

    const income = transactions.filter((t) => t.type === 'income');
    const deductibleExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.category?.name?.toLowerCase().includes('tax'),
    );

    const incomeByCategory = this.groupByCategory(income);
    const deductionsByCategory = this.groupByCategory(deductibleExpenses);

    return {
      summary: {
        totalIncome: income.reduce((sum, t) => sum + Number(t.amount), 0),
        totalDeductions: deductibleExpenses.reduce((sum, t) => sum + Number(t.amount), 0),
        taxableIncome: income.reduce((sum, t) => sum + Number(t.amount), 0) -
                       deductibleExpenses.reduce((sum, t) => sum + Number(t.amount), 0),
      },
      details: {
        income: incomeByCategory,
        deductions: deductionsByCategory,
      },
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: transactions.length,
      },
    };
  }

  private async generateYearOverYearReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const currentYearData = await this.getTransactions(userId, config, dateRange);
    const previousYearStart = subYears(dateRange.start, 1);
    const previousYearEnd = subYears(dateRange.end, 1);
    const previousYearData = await this.getTransactions(userId, config, {
      start: previousYearStart,
      end: previousYearEnd,
    });

    const currentIncome = currentYearData
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const previousIncome = previousYearData
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentExpenses = currentYearData
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const previousExpenses = previousYearData
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      summary: {
        currentYear: {
          income: currentIncome,
          expenses: currentExpenses,
          netSavings: currentIncome - currentExpenses,
        },
        previousYear: {
          income: previousIncome,
          expenses: previousExpenses,
          netSavings: previousIncome - previousExpenses,
        },
        changes: {
          incomeChange: previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0,
          expensesChange: previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0,
        },
      },
      details: [],
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: currentYearData.length + previousYearData.length,
      },
    };
  }

  private async generateMonthOverMonthReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const periods = config.comparison?.periods || 6;
    const monthlyData = [];

    for (let i = 0; i < periods; i++) {
      const monthStart = startOfMonth(subMonths(dateRange.end, i));
      const monthEnd = endOfMonth(monthStart);
      const transactions = await this.getTransactions(userId, config, {
        start: monthStart,
        end: monthEnd,
      });

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyData.push({
        month: monthStart.toISOString().slice(0, 7),
        income,
        expenses,
        netSavings: income - expenses,
      });
    }

    return {
      summary: {
        averageIncome: monthlyData.reduce((sum, m) => sum + m.income, 0) / periods,
        averageExpenses: monthlyData.reduce((sum, m) => sum + m.expenses, 0) / periods,
      },
      details: monthlyData.reverse(),
      charts: [
        {
          type: 'line',
          title: 'Income vs Expenses Trend',
          data: monthlyData,
        },
      ],
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: monthlyData.length,
      },
    };
  }

  private async generateQuarterOverQuarterReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const periods = config.comparison?.periods || 4;
    const quarterlyData = [];

    for (let i = 0; i < periods; i++) {
      const quarterStart = startOfQuarter(subQuarters(dateRange.end, i));
      const quarterEnd = endOfQuarter(quarterStart);
      const transactions = await this.getTransactions(userId, config, {
        start: quarterStart,
        end: quarterEnd,
      });

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      quarterlyData.push({
        quarter: `Q${Math.floor((quarterStart.getMonth() / 3) + 1)} ${quarterStart.getFullYear()}`,
        income,
        expenses,
        netSavings: income - expenses,
      });
    }

    return {
      summary: {
        averageIncome: quarterlyData.reduce((sum, q) => sum + q.income, 0) / periods,
        averageExpenses: quarterlyData.reduce((sum, q) => sum + q.expenses, 0) / periods,
      },
      details: quarterlyData.reverse(),
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: quarterlyData.length,
      },
    };
  }

  private async generateBudgetVsActualReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const budgets = await this.budgetRepository.find({
      where: { userId },
      relations: ['category'],
    });

    const transactions = await this.getTransactions(userId, config, dateRange);

    const budgetComparison = budgets.map((budget) => {
      const actual = transactions
        .filter((t) => t.categoryId === budget.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const budgetAmount = Number(budget.amount);
      const variance = budgetAmount - actual;
      const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

      return {
        category: budget.category?.name || 'Uncategorized',
        budget: budgetAmount,
        actual,
        variance,
        variancePercent,
        status: variance >= 0 ? 'under_budget' : 'over_budget',
      };
    });

    return {
      summary: {
        totalBudget: budgetComparison.reduce((sum, b) => sum + b.budget, 0),
        totalActual: budgetComparison.reduce((sum, b) => sum + b.actual, 0),
        totalVariance: budgetComparison.reduce((sum, b) => sum + b.variance, 0),
        categoriesOverBudget: budgetComparison.filter((b) => b.status === 'over_budget').length,
      },
      details: budgetComparison,
      charts: [
        {
          type: 'bar',
          title: 'Budget vs Actual',
          data: budgetComparison,
        },
      ],
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: budgetComparison.length,
      },
    };
  }

  private async generateCategorySpendingReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const transactions = await this.getTransactions(userId, config, dateRange);
    const expenses = transactions.filter((t) => t.type === 'expense');

    const categoryBreakdown = this.groupByCategory(expenses);
    const total = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);

    const enrichedData = categoryBreakdown.map((cat) => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0,
    }));

    return {
      summary: {
        totalSpending: total,
        categoryCount: categoryBreakdown.length,
        topCategory: enrichedData[0]?.category || 'N/A',
      },
      details: enrichedData,
      charts: [
        {
          type: 'pie',
          title: 'Category Distribution',
          data: enrichedData,
        },
      ],
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: expenses.length,
      },
    };
  }

  private async generateInvestmentPerformanceReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const investments = await this.investmentRepository.find({
      where: { userId },
    });

    const performanceData = investments.map((inv) => {
      const currentValue = Number(inv.currentValue);
      const investedAmount = Number(inv.investedAmount);
      const gain = currentValue - investedAmount;
      const gainPercent = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;

      return {
        name: inv.name,
        type: inv.type,
        investedAmount,
        currentValue,
        gain,
        gainPercent,
      };
    });

    const totalInvested = performanceData.reduce((sum, i) => sum + i.investedAmount, 0);
    const totalCurrent = performanceData.reduce((sum, i) => sum + i.currentValue, 0);
    const totalGain = totalCurrent - totalInvested;

    return {
      summary: {
        totalInvested,
        totalCurrentValue: totalCurrent,
        totalGain,
        totalGainPercent: totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0,
        investmentCount: investments.length,
      },
      details: performanceData,
      charts: [
        {
          type: 'bar',
          title: 'Investment Performance',
          data: performanceData,
        },
      ],
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: investments.length,
      },
    };
  }

  private async generateGroupExpenseSettlementReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const groupTransactions = await this.groupTransactionRepository.find({
      where: {
        userId,
        createdAt: Between(dateRange.start, dateRange.end),
      },
      relations: ['group'],
    });

    const settlementData = groupTransactions.map((gt) => ({
      group: gt.group?.name || 'Unknown',
      description: gt.description,
      amount: Number(gt.amount),
      yourShare: Number(gt.userShare),
      paid: Number(gt.paidAmount),
      balance: Number(gt.userShare) - Number(gt.paidAmount),
      date: gt.date,
    }));

    const totalOwed = settlementData
      .filter((s) => s.balance > 0)
      .reduce((sum, s) => sum + s.balance, 0);
    const totalOwing = settlementData
      .filter((s) => s.balance < 0)
      .reduce((sum, s) => sum + Math.abs(s.balance), 0);

    return {
      summary: {
        totalOwed,
        totalOwing,
        netBalance: totalOwing - totalOwed,
      },
      details: settlementData,
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: groupTransactions.length,
      },
    };
  }

  private async generateCashFlowReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const transactions = await this.getTransactions(userId, config, dateRange);

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const operatingCashFlow = income - expenses;

    return {
      summary: {
        cashInflow: income,
        cashOutflow: expenses,
        netCashFlow: operatingCashFlow,
      },
      details: transactions.map((t) => ({
        date: t.date,
        description: t.description,
        type: t.type,
        amount: Number(t.amount),
        category: t.category?.name || 'Uncategorized',
      })),
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: transactions.length,
      },
    };
  }

  private async generateNetWorthReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const accounts = await this.accountRepository.find({
      where: { userId },
    });

    const investments = await this.investmentRepository.find({
      where: { userId },
    });

    const lendBorrowRecords = await this.lendBorrowRepository.find({
      where: { userId },
    });

    const totalAssets = accounts
      .filter((a) => Number(a.balance) > 0)
      .reduce((sum, a) => sum + Number(a.balance), 0);

    const investmentValue = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);

    const totalLiabilities = accounts
      .filter((a) => Number(a.balance) < 0)
      .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

    const netLendBorrow = lendBorrowRecords.reduce((sum, lb) => {
      const amount = Number(lb.amount) - Number(lb.paidAmount);
      return sum + (lb.type === 'lend' ? amount : -amount);
    }, 0);

    const netWorth = totalAssets + investmentValue + netLendBorrow - totalLiabilities;

    return {
      summary: {
        totalAssets: totalAssets + investmentValue + Math.max(0, netLendBorrow),
        totalLiabilities: totalLiabilities + Math.abs(Math.min(0, netLendBorrow)),
        netWorth,
      },
      details: {
        accounts: accounts.map((a) => ({
          name: a.name,
          type: a.type,
          balance: Number(a.balance),
        })),
        investments: investments.map((i) => ({
          name: i.name,
          type: i.type,
          value: Number(i.currentValue),
        })),
      },
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: accounts.length + investments.length,
      },
    };
  }

  private async generateProfitLossReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const transactions = await this.getTransactions(userId, config, dateRange);

    const income = transactions.filter((t) => t.type === 'income');
    const expenses = transactions.filter((t) => t.type === 'expense');

    const incomeByCategory = this.groupByCategory(income);
    const expensesByCategory = this.groupByCategory(expenses);

    const totalIncome = incomeByCategory.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = expensesByCategory.reduce((sum, c) => sum + c.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      summary: {
        revenue: totalIncome,
        expenses: totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
      },
      details: {
        income: incomeByCategory,
        expenses: expensesByCategory,
      },
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: transactions.length,
      },
    };
  }

  private async generateCustomReport(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<ReportData> {
    const transactions = await this.getTransactions(userId, config, dateRange);

    // Apply custom metrics
    const data = this.applyMetrics(transactions, config.metrics);

    // Apply grouping
    const groupedData = config.groupBy
      ? this.applyGrouping(transactions, config.groupBy)
      : transactions;

    return {
      summary: data,
      details: groupedData,
      metadata: {
        generatedAt: new Date(),
        dataRange: dateRange,
        recordCount: transactions.length,
      },
    };
  }

  private async getTransactions(
    userId: string,
    config: ReportConfig,
    dateRange: { start: Date; end: Date },
  ): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.tags', 'tags')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.date BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      })
      .andWhere('transaction.isDeleted = :isDeleted', { isDeleted: false });

    // Apply filters
    if (config.filters?.categories?.length) {
      queryBuilder.andWhere('transaction.categoryId IN (:...categories)', {
        categories: config.filters.categories,
      });
    }

    if (config.filters?.accounts?.length) {
      queryBuilder.andWhere('transaction.accountId IN (:...accounts)', {
        accounts: config.filters.accounts,
      });
    }

    if (config.filters?.transactionTypes?.length) {
      queryBuilder.andWhere('transaction.type IN (:...types)', {
        types: config.filters.transactionTypes,
      });
    }

    if (config.filters?.amountRange) {
      queryBuilder.andWhere('transaction.amount BETWEEN :min AND :max', {
        min: config.filters.amountRange.min,
        max: config.filters.amountRange.max,
      });
    }

    // Apply sorting
    if (config.sortBy) {
      queryBuilder.orderBy(
        `transaction.${config.sortBy}`,
        config.sortOrder || 'DESC',
      );
    } else {
      queryBuilder.orderBy('transaction.date', 'DESC');
    }

    // Apply limit
    if (config.limit) {
      queryBuilder.take(config.limit);
    }

    return queryBuilder.getMany();
  }

  private groupByCategory(transactions: Transaction[]): any[] {
    const grouped = transactions.reduce((acc, t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: categoryName,
          amount: 0,
          count: 0,
        };
      }
      acc[categoryName].amount += Number(t.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a, b) => b.amount - a.amount);
  }

  private applyMetrics(transactions: Transaction[], metrics: ReportMetric[]): Record<string, any> {
    const result: Record<string, any> = {};

    if (metrics.includes('sum' as ReportMetric)) {
      result.sum = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    }

    if (metrics.includes('average' as ReportMetric)) {
      result.average = transactions.length > 0
        ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length
        : 0;
    }

    if (metrics.includes('count' as ReportMetric)) {
      result.count = transactions.length;
    }

    if (metrics.includes('min' as ReportMetric)) {
      result.min = transactions.length > 0
        ? Math.min(...transactions.map((t) => Number(t.amount)))
        : 0;
    }

    if (metrics.includes('max' as ReportMetric)) {
      result.max = transactions.length > 0
        ? Math.max(...transactions.map((t) => Number(t.amount)))
        : 0;
    }

    return result;
  }

  private applyGrouping(transactions: Transaction[], groupBy: string[]): any[] {
    // Simplified grouping - can be enhanced based on requirements
    return transactions.map((t) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      category: t.category?.name || 'Uncategorized',
      account: t.account?.name || 'Unknown',
      type: t.type,
    }));
  }
}
