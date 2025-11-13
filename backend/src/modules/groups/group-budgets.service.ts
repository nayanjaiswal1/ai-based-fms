import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupBudget, GroupMember, GroupTransaction } from '@database/entities';
import { CreateGroupBudgetDto, UpdateGroupBudgetDto } from './dto/group-budget.dto';

@Injectable()
export class GroupBudgetsService {
  constructor(
    @InjectRepository(GroupBudget)
    private budgetRepository: Repository<GroupBudget>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    @InjectRepository(GroupTransaction)
    private transactionRepository: Repository<GroupTransaction>,
  ) {}

  async create(groupId: string, userId: string, createDto: CreateGroupBudgetDto) {
    await this.checkMemberAccess(groupId, userId);

    const budget = this.budgetRepository.create({
      ...createDto,
      groupId,
      createdBy: userId,
      spent: 0,
      lastResetDate: new Date(createDto.startDate),
    });

    return this.budgetRepository.save(budget);
  }

  async findAll(groupId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    const budgets = await this.budgetRepository.find({
      where: { groupId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    // Calculate spent amount for each budget
    for (const budget of budgets) {
      budget.spent = await this.calculateSpent(budget);
      await this.budgetRepository.save(budget);
    }

    return budgets;
  }

  async findOne(id: string, userId: string) {
    const budget = await this.budgetRepository.findOne({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.checkMemberAccess(budget.groupId, userId);

    // Update spent amount
    budget.spent = await this.calculateSpent(budget);
    await this.budgetRepository.save(budget);

    return budget;
  }

  async update(id: string, userId: string, updateDto: UpdateGroupBudgetDto) {
    const budget = await this.findOne(id, userId);

    Object.assign(budget, { ...updateDto, updatedBy: userId });

    return this.budgetRepository.save(budget);
  }

  async remove(id: string, userId: string) {
    const budget = await this.findOne(id, userId);
    budget.isActive = false;
    await this.budgetRepository.save(budget);
    return { success: true, message: 'Budget deleted successfully' };
  }

  async getProgress(id: string, userId: string) {
    const budget = await this.findOne(id, userId);

    const percentage = (budget.spent / budget.amount) * 100;
    const remaining = Math.max(0, budget.amount - budget.spent);
    const isOverBudget = budget.spent > budget.amount;
    const isNearLimit = percentage >= budget.warningThreshold;

    return {
      budget,
      spent: budget.spent,
      amount: budget.amount,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      isOverBudget,
      isNearLimit,
    };
  }

  private async calculateSpent(budget: GroupBudget): Promise<number> {
    const startDate = budget.lastResetDate || budget.startDate;
    const endDate = budget.endDate ? new Date(budget.endDate) : new Date();

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.groupId = :groupId', { groupId: budget.groupId })
      .andWhere('transaction.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate });

    if (budget.categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', {
        categoryId: budget.categoryId,
      });
    }

    const transactions = await queryBuilder.getMany();

    return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  private async checkMemberAccess(groupId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return member;
  }
}
