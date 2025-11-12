import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache service wrapper
 * Provides high-level caching utilities
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.cacheManager.set(key, value, ttl * 1000);
      } else {
        await this.cacheManager.set(key, value);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete item from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
    } catch (error) {
      console.error('Cache delete many error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error('Cache reset error:', error);
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Invalidate user-specific caches
   */
  async invalidateUserCache(userId: string, patterns: string[]): Promise<void> {
    const keys = patterns.map((pattern) => pattern.replace('{userId}', userId));
    await this.delMany(keys);
  }

  /**
   * Warm cache with data
   */
  async warmCache<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await fn();
      await this.set(key, data, ttl);
      console.log(`Cache warmed: ${key}`);
    } catch (error) {
      console.error(`Cache warming error for key ${key}:`, error);
    }
  }

  /**
   * Get cache statistics (if supported by cache store)
   */
  async getStats(): Promise<any> {
    // This would depend on the cache store implementation
    // For Redis, you could use INFO command
    return {
      // Placeholder - implement based on cache store
    };
  }

  /**
   * Build cache key with user context
   */
  buildUserKey(userId: string, key: string): string {
    return `user:${userId}:${key}`;
  }

  /**
   * Build cache key with entity context
   */
  buildEntityKey(entity: string, id: string, key?: string): string {
    if (key) {
      return `${entity}:${id}:${key}`;
    }
    return `${entity}:${id}`;
  }

  /**
   * Cache dashboard data
   */
  async cacheDashboard(userId: string, data: any): Promise<void> {
    const key = this.buildUserKey(userId, 'dashboard');
    await this.set(key, data, 300); // 5 minutes
  }

  /**
   * Get cached dashboard data
   */
  async getCachedDashboard(userId: string): Promise<any> {
    const key = this.buildUserKey(userId, 'dashboard');
    return this.get(key);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(userId: string, period: string, data: any): Promise<void> {
    const key = this.buildUserKey(userId, `analytics:${period}`);
    await this.set(key, data, 900); // 15 minutes
  }

  /**
   * Get cached analytics data
   */
  async getCachedAnalytics(userId: string, period: string): Promise<any> {
    const key = this.buildUserKey(userId, `analytics:${period}`);
    return this.get(key);
  }

  /**
   * Cache budget summaries
   */
  async cacheBudgetSummary(userId: string, data: any): Promise<void> {
    const key = this.buildUserKey(userId, 'budget-summary');
    await this.set(key, data, 600); // 10 minutes
  }

  /**
   * Get cached budget summary
   */
  async getCachedBudgetSummary(userId: string): Promise<any> {
    const key = this.buildUserKey(userId, 'budget-summary');
    return this.get(key);
  }

  /**
   * Cache account balances
   */
  async cacheAccountBalances(userId: string, data: any): Promise<void> {
    const key = this.buildUserKey(userId, 'account-balances');
    await this.set(key, data, 300); // 5 minutes
  }

  /**
   * Get cached account balances
   */
  async getCachedAccountBalances(userId: string): Promise<any> {
    const key = this.buildUserKey(userId, 'account-balances');
    return this.get(key);
  }

  /**
   * Cache category statistics
   */
  async cacheCategoryStats(userId: string, data: any): Promise<void> {
    const key = this.buildUserKey(userId, 'category-stats');
    await this.set(key, data, 1800); // 30 minutes
  }

  /**
   * Get cached category statistics
   */
  async getCachedCategoryStats(userId: string): Promise<any> {
    const key = this.buildUserKey(userId, 'category-stats');
    return this.get(key);
  }

  /**
   * Invalidate all user data caches
   */
  async invalidateAllUserCaches(userId: string): Promise<void> {
    const patterns = [
      'dashboard',
      'analytics:*',
      'budget-summary',
      'account-balances',
      'category-stats',
    ];

    await Promise.all(
      patterns.map((pattern) => {
        const key = this.buildUserKey(userId, pattern);
        return this.del(key);
      }),
    );
  }
}
