import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, Transaction, AuditLog, Group, Budget } from '@database/entities';
import * as os from 'os';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  // System Metrics
  async getSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuUsage = os.loadavg();
    const uptime = os.uptime();

    return {
      memory: {
        total: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100,
        free: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100,
        usagePercentage: Math.round((usedMem / totalMem) * 100),
      },
      cpu: {
        loadAverage: cpuUsage,
        cores: os.cpus().length,
      },
      system: {
        platform: os.platform(),
        uptime: Math.round(uptime / 3600), // hours
        hostname: os.hostname(),
      },
      timestamp: new Date(),
    };
  }

  // User Activity Metrics
  async getUserActivityMetrics(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { updatedAt: MoreThan(since) },
    });
    const newUsers = await this.userRepository.count({
      where: { createdAt: MoreThan(since) },
    });

    // User tier distribution
    const tierDistribution = await this.userRepository
      .createQueryBuilder('user')
      .select('user.subscriptionTier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.subscriptionTier')
      .getRawMany();

    // Daily active users for the past week
    const dailyActiveUsers = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await this.userRepository.count({
        where: {
          updatedAt: MoreThan(date),
        },
      });

      dailyActiveUsers.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return {
      totalUsers,
      activeUsers,
      newUsers,
      inactiveUsers: totalUsers - activeUsers,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      tierDistribution,
      dailyActiveUsers,
    };
  }

  // Feature Usage Analytics
  async getFeatureUsageAnalytics() {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const transactionStats = {
      total: await this.transactionRepository.count(),
      lastMonth: await this.transactionRepository.count({
        where: { createdAt: MoreThan(lastMonth) },
      }),
      avgPerUser: 0,
    };

    const groupStats = {
      total: await this.groupRepository.count(),
      active: await this.groupRepository.count({ where: { isActive: true } }),
      lastMonth: await this.groupRepository.count({
        where: { createdAt: MoreThan(lastMonth) },
      }),
    };

    const budgetStats = {
      total: await this.budgetRepository.count(),
      active: await this.budgetRepository.count({ where: { isActive: true } }),
      lastMonth: await this.budgetRepository.count({
        where: { createdAt: MoreThan(lastMonth) },
      }),
    };

    const userCount = await this.userRepository.count();
    transactionStats.avgPerUser = userCount > 0 ? Math.round(transactionStats.total / userCount) : 0;

    // Most used features (based on audit logs)
    const featureUsage = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'feature')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt > :since', { since: lastMonth })
      .groupBy('log.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      transactions: transactionStats,
      groups: groupStats,
      budgets: budgetStats,
      featureUsage,
    };
  }

  // Database Metrics
  async getDatabaseMetrics() {
    const tables = [
      { name: 'users', repository: this.userRepository },
      { name: 'transactions', repository: this.transactionRepository },
      { name: 'groups', repository: this.groupRepository },
      { name: 'budgets', repository: this.budgetRepository },
      { name: 'audit_logs', repository: this.auditLogRepository },
    ];

    const tableStats = await Promise.all(
      tables.map(async ({ name, repository }) => ({
        name,
        count: await repository.count(),
      }))
    );

    return {
      tables: tableStats,
      totalRecords: tableStats.reduce((sum, table) => sum + table.count, 0),
    };
  }

  // User Heatmap Data (activity by hour and day)
  async getUserActivityHeatmap() {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const activities = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.createdAt)', 'date')
      .addSelect('EXTRACT(HOUR FROM log.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt > :since', { since: last7Days })
      .groupBy('date, hour')
      .orderBy('date', 'DESC')
      .addOrderBy('hour', 'ASC')
      .getRawMany();

    return activities.map(activity => ({
      date: activity.date,
      hour: parseInt(activity.hour),
      count: parseInt(activity.count),
    }));
  }

  // Error Rate Monitoring
  async getErrorRateMetrics() {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const totalLogs = await this.auditLogRepository.count({
      where: { createdAt: MoreThan(last24Hours) },
    });

    // This would ideally track actual errors from a logging service
    // For now, we'll use audit logs as a proxy
    const hourlyActivity = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      hour.setMinutes(0, 0, 0);
      const nextHour = new Date(hour);
      nextHour.setHours(nextHour.getHours() + 1);

      const count = await this.auditLogRepository.count({
        where: {
          createdAt: MoreThan(hour),
        },
      });

      hourlyActivity.push({
        hour: hour.getHours(),
        count,
      });
    }

    return {
      last24Hours: totalLogs,
      hourlyActivity,
    };
  }

  // Comprehensive Dashboard Data
  async getDashboardData() {
    const [systemMetrics, userActivity, featureUsage, dbMetrics] = await Promise.all([
      this.getSystemMetrics(),
      this.getUserActivityMetrics(),
      this.getFeatureUsageAnalytics(),
      this.getDatabaseMetrics(),
    ]);

    return {
      system: systemMetrics,
      users: userActivity,
      features: featureUsage,
      database: dbMetrics,
      generatedAt: new Date(),
    };
  }
}
