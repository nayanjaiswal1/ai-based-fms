/**
 * Example: Dashboard Service with Redis Caching
 *
 * This file demonstrates how to integrate Redis caching into services
 * Copy this pattern to other services as needed
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../services/cache.service';

// Example entity
class Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

/**
 * Dashboard service with caching
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private cacheService: CacheService,
  ) {}

  /**
   * Get dashboard statistics with caching
   * Cache TTL: 5 minutes
   */
  async getDashboardStats(userId: string) {
    // Try to get from cache first
    const cached = await this.cacheService.getCachedDashboard(userId);
    if (cached) {
      console.log('✅ Cache hit: dashboard stats');
      return cached;
    }

    console.log('❌ Cache miss: dashboard stats - fetching from DB');

    // Fetch from database
    const stats = await this.calculateDashboardStats(userId);

    // Cache the result
    await this.cacheService.cacheDashboard(userId, stats);

    return stats;
  }

  /**
   * Alternative: Using getOrSet pattern
   */
  async getDashboardStatsV2(userId: string) {
    const cacheKey = this.cacheService.buildUserKey(userId, 'dashboard');

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.calculateDashboardStats(userId),
      300, // 5 minutes TTL
    );
  }

  /**
   * Calculate dashboard statistics from database
   */
  async calculateDashboardStats(userId: string) {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // Use optimized query with indexes
    const [totalIncome, totalExpense, transactionCount] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'income' })
        .andWhere('t.date >= :startDate', { startDate: currentMonth })
        .getRawOne()
        .then((r) => parseFloat(r.total)),

      this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.date >= :startDate', { startDate: currentMonth })
        .getRawOne()
        .then((r) => parseFloat(r.total)),

      this.transactionRepository
        .createQueryBuilder('t')
        .where('t.userId = :userId', { userId })
        .andWhere('t.date >= :startDate', { startDate: currentMonth })
        .getCount(),
    ]);

    return {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      transactionCount,
      month: currentMonth.toISOString(),
    };
  }

  /**
   * Invalidate cache when data changes
   * Call this after creating/updating/deleting transactions
   */
  async invalidateDashboardCache(userId: string) {
    await this.cacheService.invalidateAllUserCaches(userId);
    console.log(`🗑️ Invalidated cache for user: ${userId}`);
  }
}

/**
 * Example: Dashboard Controller with @Cache decorator
 */
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Cache } from '../decorators/cache.decorator';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('dashboard')
@UseInterceptors(CacheInterceptor)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * Get dashboard with automatic caching via decorator
   */
  @Get('stats')
  @Cache({ key: 'dashboard:{userId}', ttl: 300, userSpecific: true })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.dashboardService.calculateDashboardStats(user.userId);
  }
}

/**
 * Example: Analytics Service with caching
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private cacheService: CacheService,
  ) {}

  /**
   * Get monthly analytics with caching
   * Cache TTL: 15 minutes
   */
  async getMonthlyAnalytics(userId: string, year: number, month: number) {
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // Try cache first
    const cached = await this.cacheService.getCachedAnalytics(userId, period);
    if (cached) {
      return cached;
    }

    // Calculate analytics
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Optimized query using indexes
    const categoryBreakdown = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.categoryId', 'categoryId')
      .addSelect('SUM(t.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.userId = :userId', { userId })
      .andWhere('t.date >= :startDate', { startDate })
      .andWhere('t.date < :endDate', { endDate })
      .groupBy('t.categoryId')
      .getRawMany();

    const analytics = {
      period,
      categoryBreakdown,
      calculatedAt: new Date(),
    };

    // Cache result
    await this.cacheService.cacheAnalytics(userId, period, analytics);

    return analytics;
  }
}

/**
 * Example: Budget Service with cache invalidation
 */
@Injectable()
export class BudgetService {
  constructor(
    private budgetRepository: Repository<any>,
    private cacheService: CacheService,
  ) {}

  /**
   * Get budget summary with caching
   */
  async getBudgetSummary(userId: string) {
    return this.cacheService.getOrSet(
      this.cacheService.buildUserKey(userId, 'budget-summary'),
      () => this.calculateBudgetSummary(userId),
      600, // 10 minutes
    );
  }

  /**
   * Create budget and invalidate caches
   */
  async createBudget(userId: string, budgetData: any) {
    const budget = await this.budgetRepository.save({
      ...budgetData,
      userId,
    });

    // Invalidate related caches
    await this.cacheService.invalidateUserCache(userId, [
      '{userId}:budget-summary',
      '{userId}:dashboard',
      '{userId}:analytics:*',
    ]);

    return budget;
  }

  private async calculateBudgetSummary(userId: string) {
    // Implementation...
    return {};
  }
}

/**
 * USAGE SUMMARY:
 *
 * 1. Service-level caching (manual):
 *    - Use CacheService methods directly
 *    - Full control over cache keys and TTL
 *    - Good for complex caching logic
 *
 * 2. Controller-level caching (automatic):
 *    - Use @Cache decorator
 *    - Use CacheInterceptor
 *    - Automatic caching based on request
 *    - Good for simple GET endpoints
 *
 * 3. Cache invalidation:
 *    - Call after mutations
 *    - Invalidate related caches
 *    - Use patterns for bulk invalidation
 *
 * 4. Performance tips:
 *    - Set appropriate TTLs based on data volatility
 *    - Use composite indexes for queries
 *    - Add pagination limits
 *    - Monitor cache hit rates
 */
