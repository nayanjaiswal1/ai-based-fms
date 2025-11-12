import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  CACHE_USER_SPECIFIC,
  INVALIDATE_CACHE_METADATA,
} from '../decorators/cache.decorator';

/**
 * Cache interceptor for automatic response caching
 * Works with @Cache decorator
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // Check for cache configuration
    const cacheKeyTemplate = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      handler,
    );
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, handler);
    const userSpecific = this.reflector.get<boolean>(
      CACHE_USER_SPECIFIC,
      handler,
    );

    // Check for cache invalidation
    const invalidateKeys = this.reflector.get<string[]>(
      INVALIDATE_CACHE_METADATA,
      handler,
    );

    // If no cache config, just continue
    if (!cacheKeyTemplate || request.method !== 'GET') {
      // Handle cache invalidation for mutations
      if (invalidateKeys && request.method !== 'GET') {
        return next.handle().pipe(
          tap(async () => {
            await this.invalidateCacheKeys(invalidateKeys, request);
          }),
        );
      }
      return next.handle();
    }

    // Build cache key
    const cacheKey = this.buildCacheKey(
      cacheKeyTemplate,
      request,
      userSpecific,
    );

    // Try to get from cache
    try {
      const cachedResponse = await this.cacheManager.get(cacheKey);
      if (cachedResponse) {
        console.log(`Cache hit: ${cacheKey}`);
        return of(cachedResponse);
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    // Cache miss - execute handler and cache result
    console.log(`Cache miss: ${cacheKey}`);
    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Only cache successful responses
          if (response && response.success !== false) {
            await this.cacheManager.set(cacheKey, response, cacheTTL * 1000);
            console.log(`Cached: ${cacheKey} (TTL: ${cacheTTL}s)`);
          }
        } catch (error) {
          console.error('Cache set error:', error);
        }
      }),
    );
  }

  /**
   * Build cache key from template
   */
  private buildCacheKey(
    template: string,
    request: any,
    userSpecific: boolean,
  ): string {
    let key = template;

    // Replace userId
    if (userSpecific && request.user?.userId) {
      key = key.replace('{userId}', request.user.userId);
    }

    // Replace id from params
    if (request.params?.id) {
      key = key.replace('{id}', request.params.id);
    }

    // Replace query params
    const queryString = JSON.stringify(request.query || {});
    key = key.replace('{query}', queryString);

    // Replace body params (for POST requests)
    const bodyString = JSON.stringify(request.body || {});
    key = key.replace('{body}', bodyString);

    return key;
  }

  /**
   * Invalidate cache keys
   */
  private async invalidateCacheKeys(
    keys: string[],
    request: any,
  ): Promise<void> {
    try {
      for (const keyTemplate of keys) {
        const key = this.buildCacheKey(keyTemplate, request, true);

        // If key has wildcards, we need to delete all matching keys
        if (key.includes('*')) {
          // Note: This requires Redis SCAN or similar for pattern matching
          // For now, we'll delete the specific key
          console.log(`Cache invalidation (pattern): ${key}`);
          // await this.deletePattern(key);
        } else {
          await this.cacheManager.del(key);
          console.log(`Cache invalidated: ${key}`);
        }
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Delete cache keys by pattern (Redis specific)
   * This would need to be implemented with Redis commands
   */
  private async deletePattern(pattern: string): Promise<void> {
    // Implementation would depend on cache-manager-redis-store
    // For now, just log
    console.log(`Would delete pattern: ${pattern}`);
  }
}
