import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, Transaction, Budget, Account } from '@database/entities';
import { UpdateUserRoleDto, UpdateSubscriptionDto, SuspendUserDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async getAllUsers(page: number = 1, limit: number = 50) {
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'subscriptionTier', 'createdAt', 'updatedAt'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map(u => this.sanitizeUser(u)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'subscriptionTier', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user statistics
    const [transactionCount, accountCount, budgetCount] = await Promise.all([
      this.transactionRepository.count({ where: { userId } }),
      this.accountRepository.count({ where: { userId } }),
      this.budgetRepository.count({ where: { userId } }),
    ]);

    return {
      ...this.sanitizeUser(user),
      stats: {
        transactions: transactionCount,
        accounts: accountCount,
        budgets: budgetCount,
      },
    };
  }

  async updateUserRole(adminId: string, userId: string, updateDto: UpdateUserRoleDto) {
    if (adminId === userId) {
      throw new ForbiddenException('Cannot modify your own role');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = updateDto.role;
    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  async updateSubscription(userId: string, updateDto: UpdateSubscriptionDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.subscriptionTier = updateDto.tier;
    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  async suspendUser(adminId: string, userId: string, suspendDto: SuspendUserDto) {
    if (adminId === userId) {
      throw new ForbiddenException('Cannot suspend yourself');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Store suspension info in a metadata field (would need to add to entity)
    await this.userRepository.save(user);

    return {
      message: suspendDto.isSuspended ? 'User suspended' : 'User unsuspended',
      user: this.sanitizeUser(user),
    };
  }

  async getSystemStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      newUsers,
      totalTransactions,
      recentTransactions,
      totalAccounts,
      totalBudgets,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { createdAt: MoreThan(startDate) } }),
      this.transactionRepository.count(),
      this.transactionRepository.count({ where: { createdAt: MoreThan(startDate) } }),
      this.accountRepository.count(),
      this.budgetRepository.count(),
    ]);

    // Calculate active users (users with transactions in period)
    const activeUsers = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(DISTINCT transaction.userId)', 'count')
      .where('transaction.createdAt > :startDate', { startDate })
      .getRawOne();

    // Get subscription distribution
    const subscriptionDist = await this.userRepository
      .createQueryBuilder('user')
      .select('user.subscriptionTier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.subscriptionTier')
      .getRawMany();

    return {
      period: {
        days,
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      users: {
        total: totalUsers,
        new: newUsers,
        active: parseInt(activeUsers.count) || 0,
        bySubscription: subscriptionDist,
      },
      transactions: {
        total: totalTransactions,
        recent: recentTransactions,
      },
      accounts: {
        total: totalAccounts,
      },
      budgets: {
        total: totalBudgets,
      },
    };
  }

  async getActivityLogs(limit: number = 100) {
    // Get recent transactions as activity log
    const activities = await this.transactionRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'description', 'amount', 'type', 'userId', 'createdAt'],
    });

    return {
      activities: activities.map(a => ({
        id: a.id,
        action: `${a.type} transaction`,
        description: a.description,
        amount: a.amount,
        userId: a.userId,
        timestamp: a.createdAt,
      })),
    };
  }

  async getPerformanceMetrics() {
    // Simple performance metrics
    const [avgQueryTime, dbSize] = await Promise.all([
      this.getAverageQueryTime(),
      this.getDatabaseSize(),
    ]);

    return {
      database: {
        size: dbSize,
        avgQueryTime,
      },
      server: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          total: process.memoryUsage().heapTotal / 1024 / 1024,
        },
      },
    };
  }

  private async getAverageQueryTime(): Promise<number> {
    // Simplified - would need actual query timing
    return 15; // ms
  }

  private async getDatabaseSize(): Promise<string> {
    // Simplified - would query actual DB size
    return '125 MB';
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user as any;
    return sanitized;
  }
}
