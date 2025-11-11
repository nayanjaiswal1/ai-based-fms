import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Budget, Transaction } from '@database/entities';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
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
      await this.budgetRepository.save(budget);
      return budget;
    }

    const transactions = await this.transactionRepository.find({ where });
    const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    budget.spent = spent;
    return this.budgetRepository.save(budget);
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
}
