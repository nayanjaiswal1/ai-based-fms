# Advanced Caching and Performance Optimization

This document describes the comprehensive caching and performance optimization implementation for the Finance Management System.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Optimizations](#frontend-optimizations)
3. [Backend Optimizations](#backend-optimizations)
4. [Database Optimizations](#database-optimizations)
5. [Testing](#testing)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Overview

The system implements multiple layers of caching and optimization:

- **Frontend**: React Query caching, Service Worker, Code Splitting, Optimistic Updates
- **Backend**: Redis caching, Response caching, Query optimization
- **Database**: Composite indexes, Query optimization
- **Build**: Asset optimization, Compression, Tree shaking

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **API Response Time**: < 200ms (cached), < 1s (uncached)
- **Cache Hit Rate**: > 70%

## Frontend Optimizations

### 1. React Query Configuration

**Location**: `/frontend/src/config/queryClient.ts`

**Features**:
- Per-data-type cache strategies
- Smart cache invalidation
- Query deduplication
- Persistent cache (localStorage)
- Background refresh
- Retry strategies

**Cache Times by Data Type**:

```typescript
Transactions:  2 min stale / 10 min cache
Accounts:      5 min stale / 30 min cache
Dashboard:     3 min stale / 15 min cache
Analytics:    10 min stale / 30 min cache
Budgets:       5 min stale / 30 min cache
Categories:   15 min stale / 60 min cache
Settings:     30 min stale / 120 min cache
```

**Usage**:

```typescript
// Automatic - uses optimized defaults
const { data } = useQuery({
  queryKey: ['transactions'],
  queryFn: getTransactions,
});

// Custom configuration
const { data } = useQuery({
  queryKey: ['custom'],
  queryFn: getData,
  ...getCacheConfig('custom'),
});
```

### 2. Service Worker & Offline Support

**Location**: `/frontend/src/service-worker.ts`

**Features**:
- Offline fallback page
- Static asset caching (Cache First)
- API response caching (Network First)
- Background sync for mutations
- Update notifications

**Cache Strategies**:

- **Static Assets** (JS, CSS, fonts): Cache First, 30 days
- **Images**: Cache First, 60 days
- **API Calls**: Network First with 10s timeout, 5 min cache
- **Google Fonts**: Stale While Revalidate, 1 year

**Registration**: Automatic in `main.tsx`

### 3. Optimistic UI Updates

**Location**: `/frontend/src/hooks/useOptimisticUpdate.ts`

**Features**:
- Instant UI feedback
- Automatic rollback on error
- Pending state indicators
- Works with all CRUD operations

**Usage**:

```typescript
const { create, update, delete } = useTransactions();

// Optimistic updates are automatic!
await create(newTransaction); // UI updates immediately
await update({ id, data }); // UI updates immediately
await delete(id); // UI updates immediately
```

**Built into useCrud hook** - enabled by default, disable with `enableOptimistic: false`

### 4. Code Splitting & Lazy Loading

**Location**: `/frontend/src/App.tsx`

**Strategy**:
- Auth pages: Eager load (critical path)
- Dashboard: Lazy load with prefetch
- All other pages: Lazy load on demand
- Suspense boundaries for loading states

**Bundle Splitting**:

```
vendor-react:  React core (~150KB)
vendor-ui:     UI components (~80KB)
vendor-query:  React Query (~40KB)
vendor-charts: Recharts (~200KB) - lazy loaded
vendor-forms:  Form libraries (~50KB)
vendor-utils:  Utilities (~30KB)
vendor-i18n:   i18n (~40KB)
```

### 5. Build Optimizations

**Location**: `/frontend/vite.config.ts`

**Features**:
- PWA support with manifest
- Gzip + Brotli compression
- Tree shaking
- Console.log removal in production
- Optimized chunk splitting
- Asset inlining (< 4KB)

## Backend Optimizations

### 1. Redis Caching

**Setup**: Uses `@nestjs/cache-manager` with Redis

**Configuration**:

```typescript
// In app.module.ts
CacheModule.register({
  isGlobal: true,
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: 300, // Default 5 minutes
})
```

### 2. Cache Decorator

**Location**: `/backend/src/common/decorators/cache.decorator.ts`

**Usage**:

```typescript
@Cache({ key: 'dashboard:{userId}', ttl: 300, userSpecific: true })
@Get('stats')
async getDashboardStats(@CurrentUser() user: User) {
  return this.dashboardService.getStats(user.userId);
}
```

### 3. Cache Interceptor

**Location**: `/backend/src/common/interceptors/cache.interceptor.ts`

**Features**:
- Automatic response caching
- Template variable replacement
- Cache invalidation on mutations
- Error handling

**Setup**:

```typescript
@Controller('api/resource')
@UseInterceptors(CacheInterceptor)
export class ResourceController { }
```

### 4. Cache Service

**Location**: `/backend/src/common/services/cache.service.ts`

**Methods**:

```typescript
// Get or set pattern
await cacheService.getOrSet(key, async () => data, ttl);

// Specific caches
await cacheService.cacheDashboard(userId, data);
await cacheService.getCachedDashboard(userId);
await cacheService.cacheAnalytics(userId, period, data);

// Invalidation
await cacheService.invalidateUserCache(userId, patterns);
await cacheService.invalidateAllUserCaches(userId);
```

### 5. Recommended Cache TTLs

```typescript
Dashboard Statistics:    5 minutes  (300s)
Analytics Data:         15 minutes  (900s)
Budget Summaries:       10 minutes  (600s)
Account Balances:        5 minutes  (300s)
Category Statistics:    30 minutes  (1800s)
User Settings:          60 minutes  (3600s)
```

### 6. Cache Invalidation Strategy

**When to Invalidate**:

- **Transaction Created/Updated/Deleted**:
  - Dashboard cache
  - Analytics cache
  - Account balance cache
  - Budget summary cache

- **Budget Created/Updated/Deleted**:
  - Budget summary cache
  - Dashboard cache

- **Account Created/Updated/Deleted**:
  - Account balance cache
  - Dashboard cache

**Example**:

```typescript
async createTransaction(userId: string, data: CreateTransactionDto) {
  const transaction = await this.repository.save(data);

  // Invalidate related caches
  await this.cacheService.invalidateUserCache(userId, [
    '{userId}:dashboard',
    '{userId}:analytics:*',
    '{userId}:account-balances',
    '{userId}:budget-summary',
  ]);

  return transaction;
}
```

## Database Optimizations

### 1. Composite Indexes

**Location**: `/backend/src/database/migrations/1699999999999-AddPerformanceIndexes.ts`

**Key Indexes**:

```sql
-- Most common query patterns
idx_transactions_user_date        (userId, date DESC)
idx_transactions_user_account     (userId, accountId)
idx_transactions_user_category    (userId, categoryId)
idx_transactions_analytics        (userId, date, categoryId, type)

-- Budget queries
idx_budgets_user_period          (userId, period)
idx_budgets_user_dates           (userId, startDate, endDate)

-- Account queries
idx_accounts_user_type           (userId, type)

-- Analytics queries
idx_transactions_user_type_date  (userId, type, date DESC)
```

### 2. Query Optimization

**Best Practices**:

```typescript
// ✅ Good - Uses indexes
await repository
  .createQueryBuilder('t')
  .where('t.userId = :userId', { userId })
  .andWhere('t.date >= :startDate', { startDate })
  .andWhere('t.date <= :endDate', { endDate })
  .orderBy('t.date', 'DESC')
  .limit(100)
  .getMany();

// ❌ Bad - Doesn't use indexes efficiently
await repository.find({
  where: { userId },
  order: { createdAt: 'DESC' }, // Wrong column
});
```

**Always**:
- Use indexed columns in WHERE clauses
- Add pagination limits
- Use composite indexes for multi-column filters
- Avoid SELECT * when possible
- Use appropriate joins

### 3. Running Migrations

```bash
cd backend

# Run migrations
npm run migration:run

# Verify indexes
npm run typeorm -- query "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename"
```

## Testing

### 1. Frontend Performance Testing

```bash
cd frontend

# Build optimized production bundle
npm run build

# Analyze bundle size
npx vite-bundle-visualizer

# Preview production build
npm run preview

# Test offline functionality
# 1. Start preview server
# 2. Open DevTools > Network
# 3. Set to "Offline"
# 4. Navigate application
```

### 2. Cache Testing

**Frontend**:

```typescript
// Check React Query cache
import { queryClient } from '@config/queryClient';

// View cache
console.log(queryClient.getQueryCache().getAll());

// Clear cache
queryClient.clear();

// Check localStorage persistence
console.log(localStorage.getItem('fms-query-cache'));
```

**Backend**:

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Get cache value
GET user:123:dashboard

# Check TTL
TTL user:123:dashboard

# Clear all cache
FLUSHALL
```

### 3. Performance Metrics

**Frontend** (Chrome DevTools):

1. **Lighthouse Audit**:
   - Open DevTools > Lighthouse
   - Select "Performance, Best Practices"
   - Click "Generate Report"
   - Target: 90+ score

2. **Performance Tab**:
   - Record page load
   - Check FCP, LCP, TTI metrics
   - Identify long tasks

3. **Network Tab**:
   - Check bundle sizes
   - Verify caching headers
   - Check compression (gzip/br)

**Backend**:

```bash
# Install Redis monitoring
redis-cli --stat

# Monitor queries (PostgreSQL)
# Add to postgresql.conf:
log_min_duration_statement = 100  # Log queries > 100ms

# View slow queries
tail -f /var/log/postgresql/postgresql.log
```

## Monitoring

### 1. Cache Hit Rate

**Frontend**:

```typescript
// Add to queryClient config
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (data, query) => {
      console.log('Cache hit:', query.queryKey);
    },
  }),
});
```

**Backend**:

```typescript
// In CacheService
async getStats() {
  const info = await redis.info('stats');
  const hits = parseFloat(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
  const misses = parseFloat(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
  const hitRate = hits / (hits + misses);

  return { hits, misses, hitRate: hitRate * 100 };
}
```

### 2. Performance Monitoring

**Recommended Tools**:

- **Frontend**: Google Analytics, Sentry Performance
- **Backend**: New Relic, DataDog, Prometheus
- **Database**: pg_stat_statements, pgBadger

**Key Metrics**:

- Cache hit rate: Target > 70%
- API response time: Target < 200ms (cached), < 1s (uncached)
- Bundle size: Target < 500KB initial
- Database query time: Target < 100ms

### 3. Production Checklist

Before deploying:

- [ ] Run database migrations
- [ ] Verify Redis is running and configured
- [ ] Test offline functionality
- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle sizes
- [ ] Verify cache headers
- [ ] Test cache invalidation
- [ ] Monitor error logs
- [ ] Set up performance monitoring

## Troubleshooting

### Issue: Cache not working

**Frontend**:
- Check browser DevTools > Application > Cache Storage
- Verify service worker is registered
- Check localStorage for persisted queries
- Clear cache and reload

**Backend**:
- Check Redis connection: `redis-cli ping`
- Verify cache interceptor is applied
- Check environment variables
- View Redis logs

### Issue: Stale data displayed

**Solution**:
- Reduce cache TTL
- Implement cache invalidation
- Use background refetch
- Add manual refresh button

### Issue: Bundle too large

**Solution**:
- Check bundle analyzer output
- Verify code splitting is working
- Remove unused dependencies
- Use dynamic imports for heavy components

### Issue: Database slow queries

**Solution**:
- Run EXPLAIN ANALYZE on slow queries
- Verify indexes are being used
- Add missing indexes
- Optimize query structure
- Add pagination

### Issue: Memory usage high

**Solution**:
- Set Redis maxmemory policy
- Reduce cache TTLs
- Clear old cache entries
- Monitor memory usage
- Use eviction policies

## Installation

### Frontend Dependencies

```bash
cd frontend

# Install dependencies
npm install --save-dev vite-plugin-pwa vite-plugin-compression
npm install @tanstack/query-sync-storage-persister
npm install workbox-webpack-plugin workbox-window
```

### Backend Dependencies

Already installed:
- `@nestjs/cache-manager`
- `cache-manager`
- `cache-manager-redis-store`
- `redis`

## Configuration

### Environment Variables

**Backend** (.env):

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_ITEMS=100
```

**Frontend** (.env):

```env
# API URL
VITE_API_URL=http://localhost:3000/api

# Cache Configuration
VITE_CACHE_VERSION=v1
VITE_ENABLE_SW=true
```

## Next Steps

1. **Monitor Performance**: Set up monitoring tools
2. **A/B Testing**: Test different cache strategies
3. **CDN**: Add CDN for static assets
4. **Image Optimization**: Convert images to WebP
5. **Database**: Consider read replicas for scale
6. **Microservices**: Consider caching layer (Varnish/Nginx)

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
