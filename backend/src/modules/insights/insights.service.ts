import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OpenAI } from 'openai';
import { Transaction, TransactionType, Budget, Category } from '@database/entities';
import {
  InsightsOptionsDto,
  InsightType,
} from './dto/insights-options.dto';
import {
  InsightsResponseDto,
  InsightDto,
  InsightSeverity,
  FinancialHealthDto,
  SavingsOpportunityDto,
  CategoryTrendDto,
  PredictionDto,
} from './dto/insights-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InsightsService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate all insights for a user
   */
  async generateInsights(
    userId: string,
    options: InsightsOptionsDto = {},
  ): Promise<InsightsResponseDto> {
    // Check cache first
    const cacheKey = `insights:${userId}:${JSON.stringify(options)}`;
    const cached = await this.cacheManager.get<InsightsResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const startDate = options.startDate
      ? new Date(options.startDate)
      : new Date(new Date().setMonth(endDate.getMonth() - 1));

    const insights: InsightDto[] = [];

    // Generate different types of insights based on options
    const types = options.types || Object.values(InsightType);

    if (types.includes(InsightType.SPENDING)) {
      const spendingInsights = await this.getSpendingInsights(userId, startDate, endDate);
      insights.push(...spendingInsights);
    }

    if (types.includes(InsightType.BUDGET)) {
      const budgetInsights = await this.getBudgetInsights(userId);
      insights.push(...budgetInsights);
    }

    if (types.includes(InsightType.SAVINGS)) {
      const savingsInsights = await this.getSavingsInsights(userId, startDate, endDate);
      insights.push(...savingsInsights);
    }

    if (types.includes(InsightType.ANOMALY)) {
      const anomalyInsights = await this.getAnomalyDetection(userId, startDate, endDate);
      insights.push(...anomalyInsights);
    }

    if (types.includes(InsightType.TREND)) {
      const trendInsights = await this.getCategoryTrendsInsights(userId);
      insights.push(...trendInsights);
    }

    // Get additional data
    const financialHealth = types.includes(InsightType.HEALTH)
      ? await this.getFinancialHealth(userId)
      : undefined;

    const savingsOpportunities = types.includes(InsightType.SAVINGS)
      ? await this.getSavingsOpportunities(userId, startDate, endDate)
      : undefined;

    const categoryTrends = types.includes(InsightType.TREND)
      ? await this.getCategoryTrends(userId)
      : undefined;

    const predictions =
      types.includes(InsightType.PREDICTION) || options.includePredictions
        ? await this.getPredictions(userId)
        : undefined;

    // Use AI for enhanced insights if requested
    if (options.useAI && this.openai) {
      const aiInsights = await this.generateAIInsights(
        userId,
        startDate,
        endDate,
        insights,
      );
      insights.push(...aiInsights);
    }

    // Build summary
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    insights.forEach((insight) => {
      byType[insight.type] = (byType[insight.type] || 0) + 1;
      bySeverity[insight.severity] = (bySeverity[insight.severity] || 0) + 1;
    });

    const response: InsightsResponseDto = {
      summary: {
        totalInsights: insights.length,
        byType,
        bySeverity,
      },
      insights: insights.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2, success: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      financialHealth,
      savingsOpportunities,
      categoryTrends,
      predictions,
      generatedAt: new Date(),
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    };

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, response, 3600000);

    return response;
  }

  /**
   * Get spending pattern insights
   */
  async getSpendingInsights(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
      relations: ['category'],
    });

    if (transactions.length === 0) {
      return insights;
    }

    // Get previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = startDate;

    const prevTransactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(prevStartDate, prevEndDate),
        isDeleted: false,
      },
      relations: ['category'],
    });

    // Category comparison
    const currentByCategory = this.groupByCategory(transactions);
    const prevByCategory = this.groupByCategory(prevTransactions);

    for (const [category, currentAmount] of Object.entries(currentByCategory)) {
      const prevAmount = prevByCategory[category] || 0;
      const change = currentAmount - prevAmount;
      const changePercentage = prevAmount > 0 ? (change / prevAmount) * 100 : 100;

      if (Math.abs(changePercentage) > 20 && Math.abs(change) > 50) {
        insights.push({
          id: uuidv4(),
          type: 'spending',
          severity: changePercentage > 0 ? InsightSeverity.WARNING : InsightSeverity.SUCCESS,
          title: `${category} Spending ${changePercentage > 0 ? 'Increased' : 'Decreased'}`,
          description: `You spent ${changePercentage > 0 ? changePercentage.toFixed(1) + '% more' : Math.abs(changePercentage).toFixed(1) + '% less'} on ${category} this period compared to last period ($${currentAmount.toFixed(2)} vs $${prevAmount.toFixed(2)})`,
          actionable:
            changePercentage > 0
              ? `Consider reviewing your ${category} expenses to identify areas for reduction`
              : `Great job reducing ${category} expenses! Keep up the good work`,
          impact: `${changePercentage > 0 ? 'Increased costs' : 'Savings'} of $${Math.abs(change).toFixed(2)}`,
          category,
          amount: change,
          percentage: changePercentage,
          createdAt: new Date(),
        });
      }
    }

    // Day of week analysis
    const byDayOfWeek = this.groupByDayOfWeek(transactions);
    const maxDay = Object.entries(byDayOfWeek).reduce((a, b) => (a[1] > b[1] ? a : b));
    const avgDailySpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0) / 7;

    if (Number(maxDay[1]) > avgDailySpending * 1.5) {
      insights.push({
        id: uuidv4(),
        type: 'spending',
        severity: InsightSeverity.INFO,
        title: 'Highest Spending Day Identified',
        description: `Your highest spending day is ${maxDay[0]} with average spending of $${Number(maxDay[1]).toFixed(2)}`,
        actionable: `Plan ahead for ${maxDay[0]}s to avoid impulsive purchases`,
        category: 'Pattern',
        amount: Number(maxDay[1]),
        createdAt: new Date(),
      });
    }

    // End of month spending spike
    const endOfMonthTransactions = transactions.filter((t) => {
      const day = new Date(t.date).getDate();
      return day >= 25;
    });

    const endOfMonthSpending = endOfMonthTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const totalSpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    if (endOfMonthSpending > totalSpending * 0.4) {
      insights.push({
        id: uuidv4(),
        type: 'spending',
        severity: InsightSeverity.WARNING,
        title: 'End-of-Month Spending Spike',
        description: `${((endOfMonthSpending / totalSpending) * 100).toFixed(1)}% of your monthly spending occurs in the last week`,
        actionable: 'Try to distribute expenses more evenly throughout the month',
        impact: 'Better cash flow management',
        amount: endOfMonthSpending,
        percentage: (endOfMonthSpending / totalSpending) * 100,
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Get budget performance insights
   */
  async getBudgetInsights(userId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    const budgets = await this.budgetRepository.find({
      where: { userId, isActive: true },
    });

    const now = new Date();

    for (const budget of budgets) {
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysElapsed = Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysRemaining = totalDays - daysElapsed;

      const percentageUsed = (Number(budget.spent) / Number(budget.amount)) * 100;
      const percentageTimeElapsed = (daysElapsed / totalDays) * 100;

      // Budget on track
      if (
        percentageUsed <= percentageTimeElapsed + 10 &&
        percentageUsed >= percentageTimeElapsed - 10
      ) {
        insights.push({
          id: uuidv4(),
          type: 'budget',
          severity: InsightSeverity.SUCCESS,
          title: `${budget.name} Budget On Track`,
          description: `You've used ${percentageUsed.toFixed(1)}% of your budget with ${percentageTimeElapsed.toFixed(1)}% of the period elapsed`,
          actionable: 'Keep maintaining your current spending pace',
          category: budget.name,
          percentage: percentageUsed,
          createdAt: new Date(),
        });
      }
      // Budget at risk
      else if (percentageUsed > percentageTimeElapsed + 10) {
        const projectedSpending =
          (Number(budget.spent) / daysElapsed) * totalDays;
        const overspend = projectedSpending - Number(budget.amount);

        insights.push({
          id: uuidv4(),
          type: 'budget',
          severity:
            percentageUsed > 90 ? InsightSeverity.ERROR : InsightSeverity.WARNING,
          title: `${budget.name} Budget Will Exceed Limit`,
          description: `At current pace, you'll spend $${projectedSpending.toFixed(2)} (${overspend > 0 ? '+$' + overspend.toFixed(2) : ''} over budget)`,
          actionable: `Reduce ${budget.name} spending by $${(overspend / daysRemaining).toFixed(2)}/day to stay on budget`,
          impact: `Potential overspend of $${overspend.toFixed(2)}`,
          category: budget.name,
          amount: overspend,
          percentage: percentageUsed,
          createdAt: new Date(),
        });
      }
      // Under budget
      else if (percentageUsed < percentageTimeElapsed - 20) {
        insights.push({
          id: uuidv4(),
          type: 'budget',
          severity: InsightSeverity.SUCCESS,
          title: `Excellent Budget Management: ${budget.name}`,
          description: `You're ${(percentageTimeElapsed - percentageUsed).toFixed(1)}% under your expected spending`,
          actionable: 'Consider reallocating unused budget to savings',
          category: budget.name,
          percentage: percentageUsed,
          createdAt: new Date(),
        });
      }
    }

    // Check for consistent budget adherence
    const budgetsOverLimit = budgets.filter(
      (b) => Number(b.spent) > Number(b.amount),
    ).length;

    if (budgets.length >= 3 && budgetsOverLimit === 0) {
      insights.push({
        id: uuidv4(),
        type: 'budget',
        severity: InsightSeverity.SUCCESS,
        title: 'Outstanding Budget Discipline',
        description: `You've stayed within budget across all ${budgets.length} categories!`,
        actionable: 'Keep up the excellent financial discipline',
        impact: 'Strong financial health',
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Get savings opportunity insights
   */
  async getSavingsInsights(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
      relations: ['category'],
    });

    const income = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.INCOME,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
    });

    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Savings rate analysis
    if (savingsRate < 10 && totalIncome > 0) {
      insights.push({
        id: uuidv4(),
        type: 'savings',
        severity: InsightSeverity.WARNING,
        title: 'Low Savings Rate',
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend 20% or higher`,
        actionable: 'Try to increase savings by reducing discretionary spending',
        impact: `Increasing to 20% would save an additional $${((totalIncome * 0.2 - savings) / 30).toFixed(2)}/day`,
        percentage: savingsRate,
        createdAt: new Date(),
      });
    } else if (savingsRate >= 20) {
      insights.push({
        id: uuidv4(),
        type: 'savings',
        severity: InsightSeverity.SUCCESS,
        title: 'Excellent Savings Rate',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income - above the recommended 20%!`,
        actionable: 'Consider investing excess savings for long-term growth',
        impact: `You've saved $${savings.toFixed(2)} this period`,
        amount: savings,
        percentage: savingsRate,
        createdAt: new Date(),
      });
    }

    // Subscription analysis
    const recurringTransactions = this.findRecurringTransactions(transactions);
    const subscriptionTotal = recurringTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    if (subscriptionTotal > totalExpenses * 0.1) {
      insights.push({
        id: uuidv4(),
        type: 'savings',
        severity: InsightSeverity.WARNING,
        title: 'High Subscription Costs',
        description: `Recurring subscriptions cost you $${subscriptionTotal.toFixed(2)}/month (${((subscriptionTotal / totalExpenses) * 100).toFixed(1)}% of expenses)`,
        actionable: 'Review and cancel unused subscriptions',
        impact: `Potential savings of $${(subscriptionTotal * 0.3).toFixed(2)}/month by eliminating 30% of subscriptions`,
        amount: subscriptionTotal,
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Detect anomalies and unusual patterns
   */
  async getAnomalyDetection(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
      relations: ['category'],
    });

    // Get historical data for comparison (last 3 months)
    const historicalStartDate = new Date(startDate);
    historicalStartDate.setMonth(historicalStartDate.getMonth() - 3);

    const historicalTransactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(historicalStartDate, startDate),
        isDeleted: false,
      },
      relations: ['category'],
    });

    // Calculate category averages and standard deviations
    const categoryStats = this.calculateCategoryStats(historicalTransactions);

    // Detect unusual transactions
    for (const transaction of transactions) {
      const categoryName = transaction.category?.name || 'Uncategorized';
      const stats = categoryStats[categoryName];

      if (stats) {
        const zScore = (Number(transaction.amount) - stats.mean) / stats.stdDev;

        // Transaction is more than 2 standard deviations above mean
        if (zScore > 2) {
          insights.push({
            id: uuidv4(),
            type: 'anomaly',
            severity: InsightSeverity.WARNING,
            title: 'Unusual Transaction Detected',
            description: `$${Number(transaction.amount).toFixed(2)} on ${categoryName} is significantly higher than your average of $${stats.mean.toFixed(2)}`,
            actionable: 'Verify this transaction is correct and not fraudulent',
            category: categoryName,
            amount: Number(transaction.amount),
            relatedData: {
              transactionId: transaction.id,
              date: transaction.date,
              description: transaction.description,
            },
            createdAt: new Date(),
          });
        }
      }
    }

    // Detect daily transaction spike
    const transactionsByDate = this.groupByDate(transactions);
    const avgDailyTransactions =
      transactions.length /
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (const [date, dayTransactions] of Object.entries(transactionsByDate)) {
      if (dayTransactions.length > avgDailyTransactions * 2) {
        insights.push({
          id: uuidv4(),
          type: 'anomaly',
          severity: InsightSeverity.INFO,
          title: 'High Transaction Activity',
          description: `You made ${dayTransactions.length} transactions on ${date}, which is higher than usual (avg: ${Math.round(avgDailyTransactions)})`,
          actionable: 'Review these transactions to ensure they were all necessary',
          relatedData: { date, count: dayTransactions.length },
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Get category-wise trend insights
   */
  async getCategoryTrendsInsights(userId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];
    const trends = await this.getCategoryTrends(userId);

    for (const trend of trends) {
      if (Math.abs(trend.changePercentage) > 15) {
        insights.push({
          id: uuidv4(),
          type: 'trend',
          severity:
            trend.trend === 'increasing'
              ? InsightSeverity.WARNING
              : InsightSeverity.INFO,
          title: `${trend.category} Spending Trend`,
          description: `${trend.category} expenses have ${trend.trend === 'increasing' ? 'increased' : 'decreased'} by ${Math.abs(trend.changePercentage).toFixed(1)}% over the past 3 months`,
          actionable:
            trend.trend === 'increasing'
              ? `Monitor and control ${trend.category} spending`
              : `Great job managing ${trend.category} expenses`,
          category: trend.category,
          amount: trend.change,
          percentage: trend.changePercentage,
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Get financial health score
   */
  async getFinancialHealth(userId: string): Promise<FinancialHealthDto> {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [transactions, budgets] = await Promise.all([
      this.transactionRepository.find({
        where: {
          userId,
          date: Between(threeMonthsAgo, now),
          isDeleted: false,
        },
      }),
      this.budgetRepository.find({
        where: { userId, isActive: true },
      }),
    ]);

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savings = income - expenses;

    // Calculate score components (each out of 25 points)

    // 1. Savings Rate (0-25 points)
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const savingsRateScore = Math.min(25, (savingsRate / 20) * 25);

    // 2. Budget Adherence (0-25 points)
    let budgetAdherenceScore = 0;
    if (budgets.length > 0) {
      const budgetsOnTrack = budgets.filter(
        (b) => Number(b.spent) <= Number(b.amount),
      ).length;
      budgetAdherenceScore = (budgetsOnTrack / budgets.length) * 25;
    } else {
      budgetAdherenceScore = 15; // Default score if no budgets set
    }

    // 3. Expense Ratio (0-25 points)
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 100;
    const expenseRatioScore = Math.max(0, 25 - (expenseRatio / 100) * 25);

    // 4. Financial Stability (0-25 points) - based on consistency
    const monthlyExpenses = this.groupByMonth(
      transactions.filter((t) => t.type === 'expense'),
    );
    const expenseVariance = this.calculateVariance(
      Object.values(monthlyExpenses).map((txs) =>
        txs.reduce((sum, t) => sum + Number(t.amount), 0),
      ),
    );
    const stabilityScore = Math.max(0, 25 - expenseVariance / 100);

    // Total score
    const totalScore = Math.round(
      savingsRateScore + budgetAdherenceScore + expenseRatioScore + stabilityScore,
    );

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    if (totalScore >= 80) status = 'excellent';
    else if (totalScore >= 60) status = 'good';
    else if (totalScore >= 40) status = 'fair';
    else status = 'needs_improvement';

    // Get previous month score for trend (simplified)
    const previousScore = await this.cacheManager.get<number>(
      `health_score:${userId}:previous`,
    );
    const currentScoreCache = await this.cacheManager.get<number>(
      `health_score:${userId}:current`,
    );

    // Store current as previous, and new as current
    if (currentScoreCache !== null && currentScoreCache !== undefined) {
      await this.cacheManager.set(
        `health_score:${userId}:previous`,
        currentScoreCache,
        86400000,
      );
    }
    await this.cacheManager.set(
      `health_score:${userId}:current`,
      totalScore,
      86400000,
    );

    const change =
      previousScore !== null && previousScore !== undefined
        ? totalScore - previousScore
        : 0;

    const recommendations: string[] = [];
    if (savingsRateScore < 15) {
      recommendations.push('Increase your savings rate by reducing discretionary spending');
    }
    if (budgetAdherenceScore < 15) {
      recommendations.push('Improve budget adherence by tracking expenses more closely');
    }
    if (expenseRatioScore < 15) {
      recommendations.push('Work on reducing your expense-to-income ratio');
    }
    if (stabilityScore < 15) {
      recommendations.push('Create more consistent spending patterns for better stability');
    }

    return {
      score: totalScore,
      status,
      breakdown: {
        savingsRate: { score: Math.round(savingsRateScore), value: savingsRate },
        budgetAdherence: {
          score: Math.round(budgetAdherenceScore),
          value:
            budgets.length > 0
              ? (budgets.filter((b) => Number(b.spent) <= Number(b.amount)).length /
                  budgets.length) *
                100
              : 0,
        },
        expenseRatio: { score: Math.round(expenseRatioScore), value: expenseRatio },
        stability: { score: Math.round(stabilityScore), value: 100 - expenseVariance },
      },
      trend: {
        change: Math.round(change),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      },
      recommendations,
    };
  }

  /**
   * Get savings opportunities
   */
  async getSavingsOpportunities(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SavingsOpportunityDto[]> {
    const opportunities: SavingsOpportunityDto[] = [];

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
      relations: ['category'],
    });

    const byCategory = this.groupByCategory(transactions);

    // Analyze each category for savings potential
    for (const [category, amount] of Object.entries(byCategory)) {
      // Dining out opportunity
      if (
        category.toLowerCase().includes('dining') ||
        category.toLowerCase().includes('restaurant') ||
        category.toLowerCase().includes('food')
      ) {
        if (amount > 200) {
          opportunities.push({
            id: uuidv4(),
            category,
            description: `You spent $${amount.toFixed(2)} on ${category.toLowerCase()}`,
            potentialSavings: amount * 0.3,
            difficulty: 'easy',
            timeframe: 'immediate',
            actionable: 'Cook at home 2-3 more times per week',
          });
        }
      }

      // Entertainment opportunity
      if (
        category.toLowerCase().includes('entertainment') ||
        category.toLowerCase().includes('hobby')
      ) {
        if (amount > 150) {
          opportunities.push({
            id: uuidv4(),
            category,
            description: `${category} expenses are $${amount.toFixed(2)}/month`,
            potentialSavings: amount * 0.2,
            difficulty: 'medium',
            timeframe: 'short_term',
            actionable: 'Look for free or low-cost entertainment alternatives',
          });
        }
      }

      // Transport opportunity
      if (
        category.toLowerCase().includes('transport') ||
        category.toLowerCase().includes('gas') ||
        category.toLowerCase().includes('fuel')
      ) {
        if (amount > 300) {
          opportunities.push({
            id: uuidv4(),
            category,
            description: `Transportation costs are $${amount.toFixed(2)}/month`,
            potentialSavings: amount * 0.15,
            difficulty: 'medium',
            timeframe: 'long_term',
            actionable: 'Consider carpooling, public transit, or remote work options',
          });
        }
      }
    }

    // Subscription opportunity
    const recurring = this.findRecurringTransactions(transactions);
    if (recurring.length > 3) {
      const total = recurring.reduce((sum, t) => sum + Number(t.amount), 0);
      opportunities.push({
        id: uuidv4(),
        category: 'Subscriptions',
        description: `You have ${recurring.length} recurring subscriptions totaling $${total.toFixed(2)}/month`,
        potentialSavings: total * 0.3,
        difficulty: 'easy',
        timeframe: 'immediate',
        actionable: 'Cancel unused subscriptions and negotiate better rates',
      });
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  /**
   * Get category trends
   */
  async getCategoryTrends(userId: string): Promise<CategoryTrendDto[]> {
    const now = new Date();
    const trends: CategoryTrendDto[] = [];

    // Get last 3 months
    const months = [0, 1, 2].map((offset) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - offset);
      return date;
    });

    const allTransactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: MoreThanOrEqual(months[2]),
        isDeleted: false,
      },
      relations: ['category'],
    });

    const categories = [
      ...new Set(allTransactions.map((t) => t.category?.name || 'Uncategorized')),
    ];

    for (const category of categories) {
      const categoryTransactions = allTransactions.filter(
        (t) => (t.category?.name || 'Uncategorized') === category,
      );

      const currentMonth = categoryTransactions
        .filter((t) => new Date(t.date).getMonth() === months[0].getMonth())
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const lastMonth = categoryTransactions
        .filter((t) => new Date(t.date).getMonth() === months[1].getMonth())
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const threeMonthSum = categoryTransactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      );
      const threeMonthAvg = threeMonthSum / 3;

      const change = currentMonth - lastMonth;
      const changePercentage = lastMonth > 0 ? (change / lastMonth) * 100 : 0;

      let trend: 'increasing' | 'decreasing' | 'stable';
      if (changePercentage > 10) trend = 'increasing';
      else if (changePercentage < -10) trend = 'decreasing';
      else trend = 'stable';

      trends.push({
        category,
        currentMonth,
        lastMonth,
        threeMonthAvg,
        change,
        changePercentage,
        trend,
      });
    }

    return trends.sort((a, b) => b.currentMonth - a.currentMonth);
  }

  /**
   * Get predictions for next month
   */
  async getPredictions(userId: string): Promise<any> {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        date: Between(threeMonthsAgo, now),
        isDeleted: false,
      },
      relations: ['category'],
    });

    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    // Calculate monthly averages
    const monthlyExpenses =
      expenses.reduce((sum, t) => sum + Number(t.amount), 0) / 3;
    const monthlyIncome = income.reduce((sum, t) => sum + Number(t.amount), 0) / 3;

    // Category predictions
    const categories = [...new Set(expenses.map((t) => t.category?.name || 'Uncategorized'))];
    const byCategory: PredictionDto[] = [];

    for (const category of categories) {
      const categoryExpenses = expenses.filter(
        (t) => (t.category?.name || 'Uncategorized') === category,
      );
      const avgAmount =
        categoryExpenses.reduce((sum, t) => sum + Number(t.amount), 0) / 3;

      // Simple linear trend
      const recent = categoryExpenses
        .slice(-10)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const older = categoryExpenses
        .slice(0, 10)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const trend = recent > older ? 1.1 : 0.9;

      byCategory.push({
        category,
        predictedAmount: avgAmount * trend,
        confidence: Math.min(95, categoryExpenses.length * 10),
        historicalAverage: avgAmount,
        basis: 'Based on 3-month average with trend adjustment',
      });
    }

    const predictedExpenses = byCategory.reduce((sum, p) => sum + p.predictedAmount, 0);
    const expectedSavings = monthlyIncome - predictedExpenses;

    // Budget risks
    const budgets = await this.budgetRepository.find({
      where: { userId, isActive: true },
    });

    const budgetRisks: string[] = [];
    for (const budget of budgets) {
      const categoryPrediction = byCategory.find((p) => p.category === budget.name);
      if (categoryPrediction && categoryPrediction.predictedAmount > Number(budget.amount)) {
        budgetRisks.push(
          `${budget.name} budget at risk (predicted: $${categoryPrediction.predictedAmount.toFixed(2)}, budget: $${budget.amount})`,
        );
      }
    }

    return {
      nextMonthExpenses: Math.round(predictedExpenses),
      expectedSavings: Math.round(expectedSavings),
      budgetRisks,
      confidence: 75,
      byCategory: byCategory.sort((a, b) => b.predictedAmount - a.predictedAmount),
    };
  }

  /**
   * Generate AI-powered insights using OpenAI
   */
  private async generateAIInsights(
    userId: string,
    startDate: Date,
    endDate: Date,
    existingInsights: InsightDto[],
  ): Promise<InsightDto[]> {
    if (!this.openai) {
      return [];
    }

    try {
      const [transactions, budgets] = await Promise.all([
        this.transactionRepository.find({
          where: {
            userId,
            date: Between(startDate, endDate),
            isDeleted: false,
          },
          relations: ['category'],
        }),
        this.budgetRepository.find({
          where: { userId, isActive: true },
        }),
      ]);

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const categoryBreakdown = this.groupByCategory(
        transactions.filter((t) => t.type === 'expense'),
      );

      const topCategories = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, amount]) => `${name}: $${amount.toFixed(2)} (${((amount / expenses) * 100).toFixed(1)}%)`);

      const prompt = `Analyze this user's financial data and provide 3 unique, actionable insights in JSON format.

Income: $${income.toFixed(2)}
Expenses: $${expenses.toFixed(2)}
Net: $${(income - expenses).toFixed(2)}
Savings Rate: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%

Top Spending Categories:
${topCategories.join('\n')}

Budgets: ${budgets.length} active budgets

Provide insights as a JSON array with this structure:
[
  {
    "type": "spending|budget|savings|trend",
    "severity": "info|warning|success",
    "title": "Brief title",
    "description": "Detailed insight",
    "actionable": "Specific action to take",
    "impact": "Expected benefit"
  }
]

Focus on unique insights not covered in existing analysis. Be specific and actionable.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        return [];
      }

      const aiInsights = JSON.parse(jsonMatch[0]);

      return aiInsights.map((insight: any) => ({
        id: uuidv4(),
        type: insight.type || 'ai',
        severity: insight.severity || InsightSeverity.INFO,
        title: insight.title,
        description: insight.description,
        actionable: insight.actionable,
        impact: insight.impact,
        createdAt: new Date(),
      }));
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return [];
    }
  }

  /**
   * Invalidate insights cache for a user
   */
  async invalidateCache(userId: string): Promise<void> {
    const keys = [`insights:${userId}:*`];
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }

  // Helper methods

  private groupByCategory(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce(
      (acc, t) => {
        const category = t.category?.name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + Number(t.amount);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private groupByDayOfWeek(transactions: Transaction[]): Record<string, number> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return transactions.reduce(
      (acc, t) => {
        const day = days[new Date(t.date).getDay()];
        acc[day] = (acc[day] || 0) + Number(t.amount);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private groupByDate(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce(
      (acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
      },
      {} as Record<string, Transaction[]>,
    );
  }

  private groupByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce(
      (acc, t) => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(t);
        return acc;
      },
      {} as Record<string, Transaction[]>,
    );
  }

  private findRecurringTransactions(transactions: Transaction[]): Transaction[] {
    // Simple heuristic: transactions with similar amounts and descriptions
    const recurring: Transaction[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < transactions.length; i++) {
      const t1 = transactions[i];
      const key = `${t1.description.toLowerCase()}_${Number(t1.amount).toFixed(0)}`;

      if (seen.has(key)) continue;

      let matchCount = 1;
      for (let j = i + 1; j < transactions.length; j++) {
        const t2 = transactions[j];
        if (
          t1.description.toLowerCase() === t2.description.toLowerCase() &&
          Math.abs(Number(t1.amount) - Number(t2.amount)) < 1
        ) {
          matchCount++;
        }
      }

      if (matchCount >= 2) {
        recurring.push(t1);
        seen.add(key);
      }
    }

    return recurring;
  }

  private calculateCategoryStats(
    transactions: Transaction[],
  ): Record<string, { mean: number; stdDev: number }> {
    const byCategory = transactions.reduce(
      (acc, t) => {
        const category = t.category?.name || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(Number(t.amount));
        return acc;
      },
      {} as Record<string, number[]>,
    );

    const stats: Record<string, { mean: number; stdDev: number }> = {};

    for (const [category, amounts] of Object.entries(byCategory)) {
      const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
      const variance =
        amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      stats[category] = { mean, stdDev };
    }

    return stats;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}
