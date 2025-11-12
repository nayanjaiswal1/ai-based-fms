import { SetMetadata } from '@nestjs/common';

/**
 * Cache decorator metadata keys
 */
export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_USER_SPECIFIC = 'cache:user-specific';

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  /**
   * Cache key prefix
   * Can use template variables: {userId}, {id}, {args}
   */
  key: string;

  /**
   * Time to live in seconds
   */
  ttl: number;

  /**
   * Whether cache should be user-specific
   * If true, adds userId to cache key automatically
   */
  userSpecific?: boolean;
}

/**
 * Cache decorator for controller methods
 * Caches the response for the specified TTL
 *
 * @example
 * @Cache({ key: 'dashboard:{userId}', ttl: 300, userSpecific: true })
 * async getDashboard() { ... }
 */
export const Cache = (config: CacheConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, config.key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, config.ttl)(target, propertyKey, descriptor);
    SetMetadata(CACHE_USER_SPECIFIC, config.userSpecific ?? true)(
      target,
      propertyKey,
      descriptor,
    );
    return descriptor;
  };
};

/**
 * Invalidate cache decorator
 * Invalidates specified cache keys after method execution
 *
 * @example
 * @InvalidateCache(['transactions:{userId}', 'dashboard:{userId}'])
 * async createTransaction() { ... }
 */
export const INVALIDATE_CACHE_METADATA = 'cache:invalidate';

export const InvalidateCache = (keys: string[]) => {
  return SetMetadata(INVALIDATE_CACHE_METADATA, keys);
};
