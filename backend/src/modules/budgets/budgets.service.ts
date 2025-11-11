import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Budget, Transaction, NotificationType } from '@database/entities';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { NotificationsGateway } from '@modules/notifications/notifications.gateway';

@Injectable()
export class BudgetsService {
  // Track which budgets have been alerted at which percentage to avoid duplicate notifications
  private alertedBudgets: Map<string, number> = new Map();

  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(userId: string, createDto: CreateBudgetDto) {
    const budget = this.budgetRepository.create({
      ...createDto,
      userId,
    });

    const saved = await this.budgetRepository.save(budget);

    // Calculate initial spent amount
    await this.updateSpentAmount(saved.id);

    return this.findOne(saved.id, userId);
  }

  async findAll(userId: string, isActive = true) {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.budgetRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(userId: string) {
    const now = new Date();
    return this.budgetRepository.find({
      where: {
        userId,
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.budgetRepository.findOne({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return budget;
  }

  async update(id: string, userId: string, updateDto: UpdateBudgetDto) {
    const budget = await this.findOne(id, userId);
    Object.assign(budget, updateDto);
    return this.budgetRepository.save(budget);
  }

  async remove(id: string, userId: string) {
    const budget = await this.findOne(id, userId);
    budget.isActive = false;
    return this.budgetRepository.save(budget);
  }

  async updateSpentAmount(budgetId: string) {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId },
    });

    if (!budget) {
      return;
    }

    // Calculate spent amount based on budget type
    const where: any = {
      userId: budget.userId,
      date: Between(budget.startDate, budget.endDate),
      type: 'expense',
      isDeleted: false,
    };

    if (budget.type === 'category' && budget.categoryId) {
      where.categoryId = budget.categoryId;
    } else if (budget.type === 'tag' && budget.tagId) {
      // For tags, we need a more complex query
      const transactions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .innerJoin('transaction.tags', 'tag')
        .where('transaction.userId = :userId', { userId: budget.userId })
        .andWhere('transaction.date BETWEEN :startDate AND :endDate', {
          startDate: budget.startDate,
          endDate: budget.endDate,
        })
        .andWhere('transaction.type = :type', { type: 'expense' })
        .andWhere('transaction.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('tag.id = :tagId', { tagId: budget.tagId })
        .getMany();

      const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      budget.spent = spent;
      const savedBudget = await this.budgetRepository.save(budget);

      // Check and send budget alert if threshold exceeded
      await this.checkAndSendBudgetAlert(savedBudget);

      return savedBudget;
    }

    const transactions = await this.transactionRepository.find({ where });
    const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    budget.spent = spent;
    const savedBudget = await this.budgetRepository.save(budget);

    // Check and send budget alert if threshold exceeded
    await this.checkAndSendBudgetAlert(savedBudget);

    return savedBudget;
  }

  async updateAllBudgetSpending(userId: string) {
    const budgets = await this.findActive(userId);
    for (const budget of budgets) {
      await this.updateSpentAmount(budget.id);
    }
  }

  async checkBudgetAlerts(userId: string) {
    const budgets = await this.findActive(userId);
    const alerts = [];

    for (const budget of budgets) {
      if (budget.alertEnabled) {
        const percentage = (budget.spent / budget.amount) * 100;
        if (percentage >= budget.alertThreshold) {
          alerts.push({
            budgetId: budget.id,
            budgetName: budget.name,
            spent: budget.spent,
            amount: budget.amount,
            percentage: percentage.toFixed(1),
            exceeded: percentage >= 100,
          });
        }
      }
    }

    return alerts;
  }

  async getBudgetSummary(userId: string) {
    const budgets = await this.findActive(userId);

    let totalBudgeted = 0;
    let totalSpent = 0;
    let overdraftCount = 0;

    for (const budget of budgets) {
      totalBudgeted += budget.amount;
      totalSpent += budget.spent;
      if (budget.spent > budget.amount) {
        overdraftCount++;
      }
    }

    return {
      totalBudgets: budgets.length,
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent,
      overdraftCount,
      budgets: budgets.map(b => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        spent: b.spent,
        remaining: b.amount - b.spent,
        percentage: ((b.spent / b.amount) * 100).toFixed(1),
        isOverBudget: b.spent > b.amount,
      })),
    };
  }

  /**
   * Check if budget threshold is exceeded and send real-time notification
   * Only sends notification if:
   * 1. Alerts are enabled for this budget
   * 2. Spending percentage >= alert threshold
   * 3. This percentage hasn't been alerted before (to avoid spam)
   */
  private async checkAndSendBudgetAlert(budget: Budget) {
    if (!budget.alertEnabled) {
      return;
    }

    const percentage = (budget.spent / budget.amount) * 100;
    const roundedPercentage = Math.floor(percentage);

    // Check if we've already alerted at this percentage level
    const lastAlertedPercentage = this.alertedBudgets.get(budget.id) || 0;

    if (
      roundedPercentage >= budget.alertThreshold &&
      roundedPercentage > lastAlertedPercentage
    ) {
      // Update tracking
      this.alertedBudgets.set(budget.id, roundedPercentage);

      // Determine alert message based on severity
      let message: string;
      if (percentage >= 100) {
        message = `You have exceeded your "${budget.name}" budget by $${(budget.spent - budget.amount).toFixed(2)}`;
      } else {
        message = `You have reached ${roundedPercentage}% of your "${budget.name}" budget ($${budget.spent.toFixed(2)} of $${budget.amount.toFixed(2)})`;
      }

      // Send real-time notification
      await this.notificationsGateway.broadcastNotification(budget.userId, {
        title: percentage >= 100 ? 'Budget Exceeded!' : 'Budget Alert',
        message,
        type: NotificationType.BUDGET_ALERT,
        data: {
          budgetId: budget.id,
          budgetName: budget.name,
          percentage: roundedPercentage,
          spent: budget.spent,
          amount: budget.amount,
          exceeded: percentage >= 100,
        },
        link: `/budgets/${budget.id}`,
      });
    }
  }
}
