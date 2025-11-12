# Performance Optimization - Quick Reference Guide

## Quick Start

### Installation

```bash
# From project root
./install-performance-deps.sh

# Or manually:
cd frontend
npm install --save-dev vite-plugin-pwa vite-plugin-compression
npm install @tanstack/query-sync-storage-persister workbox-webpack-plugin workbox-window

cd ../backend
npm run migration:run

# Start Redis
docker run -d -p 6379:6379 redis:alpine
```

### Environment Setup

```bash
# Backend .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Frontend Cheat Sheet

### Using Optimistic Updates

```typescript
// Automatic with useCrud hook
const { create, update, delete } = useTransactions();

// Create transaction - UI updates immediately
await create({ amount: 100, type: 'expense' });

// Update - shows immediately, rolls back on error
await update({ id, data: { amount: 150 } });

// Delete - removes immediately, rolls back on error
await delete(id);
```

### Custom Cache Configuration

```typescript
import { getCacheConfig } from '@config/queryClient';

const { data } = useQuery({
  queryKey: ['myData'],
  queryFn: fetchData,
  ...getCacheConfig('myData'), // Uses optimized defaults
});
```

### Prefetching Data

```typescript
import { queryClient } from '@config/queryClient';

// Prefetch before navigation
const handleNavigate = async () => {
  await queryClient.prefetchQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });
  navigate('/dashboard');
};
```

### Service Worker Management

```typescript
import { checkForUpdates, skipWaitingAndReload } from './serviceWorkerRegistration';

// Check for updates
await checkForUpdates();

// Force update
skipWaitingAndReload();
```

## Backend Cheat Sheet

### Using Cache Decorator

```typescript
import { Cache, InvalidateCache } from '@common/decorators/cache.decorator';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';

@Controller('api/resource')
@UseInterceptors(CacheInterceptor)
export class ResourceController {
  // GET with caching
  @Get()
  @Cache({ key: 'resource:{userId}', ttl: 300, userSpecific: true })
  async getAll(@CurrentUser() user: User) {
    return this.service.getAll(user.userId);
  }

  // POST with cache invalidation
  @Post()
  @InvalidateCache(['resource:{userId}', 'dashboard:{userId}'])
  async create(@CurrentUser() user: User, @Body() data: any) {
    return this.service.create(user.userId, data);
  }
}
```

### Using Cache Service

```typescript
import { CacheService } from '@common/services/cache.service';

@Injectable()
export class MyService {
  constructor(private cacheService: CacheService) {}

  // Get or set pattern
  async getData(userId: string) {
    const key = this.cacheService.buildUserKey(userId, 'my-data');
    return this.cacheService.getOrSet(
      key,
      () => this.fetchFromDatabase(userId),
      300 // 5 minutes
    );
  }

  // Manual caching
  async getWithCache(userId: string) {
    // Try cache
    const cached = await this.cacheService.get('key');
    if (cached) return cached;

    // Fetch and cache
    const data = await this.fetchData(userId);
    await this.cacheService.set('key', data, 300);
    return data;
  }

  // Invalidate on mutation
  async createItem(userId: string, data: any) {
    const item = await this.repository.save(data);

    // Invalidate related caches
    await this.cacheService.invalidateUserCache(userId, [
      '{userId}:my-data',
      '{userId}:dashboard',
    ]);

    return item;
  }
}
```

### Optimized Database Queries

```typescript
// ✅ Good - Uses indexes
await this.repository
  .createQueryBuilder('t')
  .where('t.userId = :userId', { userId })
  .andWhere('t.date >= :startDate', { startDate })
  .orderBy('t.date', 'DESC')
  .limit(100)
  .getMany();

// ✅ Good - Select specific columns
await this.repository
  .createQueryBuilder('t')
  .select(['t.id', 't.amount', 't.date'])
  .where('t.userId = :userId', { userId })
  .getMany();

// ❌ Bad - Doesn't use indexes
await this.repository.find({
  where: { userId },
  order: { createdAt: 'DESC' }, // Wrong column!
});
```

## Cache TTL Reference

```typescript
// Frontend (React Query)
Transactions:   2 min stale /  10 min cache
Accounts:       5 min stale /  30 min cache
Dashboard:      3 min stale /  15 min cache
Analytics:     10 min stale /  30 min cache
Budgets:        5 min stale /  30 min cache
Categories:    15 min stale /  60 min cache
Settings:      30 min stale / 120 min cache

// Backend (Redis)
Dashboard:       5 minutes  (300s)
Analytics:      15 minutes  (900s)
Budgets:        10 minutes  (600s)
Accounts:        5 minutes  (300s)
Categories:     30 minutes (1800s)
Settings:       60 minutes (3600s)
```

## Common Commands

### Redis

```bash
# Start Redis
docker run -d -p 6379:6379 redis:alpine
# OR
redis-server

# Connect to Redis CLI
redis-cli

# View all keys
KEYS *

# Get value
GET user:123:dashboard

# Check TTL
TTL user:123:dashboard

# Delete key
DEL user:123:dashboard

# Flush all cache
FLUSHALL

# Monitor operations
MONITOR

# Get stats
INFO stats
```

### Database

```bash
# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# View indexes
npm run typeorm -- query "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public'"

# Explain query
npm run typeorm -- query "EXPLAIN ANALYZE SELECT * FROM transactions WHERE userId = 'user-123'"
```

### Build & Testing

```bash
# Frontend
cd frontend

# Build for production
npm run build

# Analyze bundle
npx vite-bundle-visualizer

# Preview production build
npm run preview

# Run Lighthouse
npx lighthouse http://localhost:4173 --view

# Backend
cd backend

# Run tests
npm test

# Load test
ab -n 1000 -c 10 http://localhost:3000/api/dashboard
```

## Debugging

### Check React Query Cache

```javascript
// Browser console
queryClient.getQueryCache().getAll()
queryClient.getQueryData(['transactions'])
queryClient.invalidateQueries({ queryKey: ['transactions'] })
queryClient.clear()
```

### Check Service Worker Cache

```javascript
// Browser console
caches.keys().then(console.log)
caches.open('api-cache').then(cache => cache.keys().then(console.log))
```

### Check localStorage

```javascript
// Browser console
localStorage.getItem('fms-query-cache')
localStorage.clear()
```

### Monitor Network

```javascript
// Browser DevTools > Network
// Filter: fetch/xhr
// Check:
// - Response times
// - Cache headers
// - Size (from cache vs from network)
```

## Performance Targets

```
Frontend:
- First Contentful Paint:   < 1.5s
- Time to Interactive:       < 3.5s
- Largest Contentful Paint:  < 2.5s
- Initial Bundle Size:       < 500KB
- Lighthouse Score:          > 90

Backend:
- Cached API Response:       < 200ms
- Uncached API Response:     < 1s
- Cache Hit Rate:            > 70%

Database:
- Simple Query:              < 10ms
- Complex Query:             < 50ms
- Analytics Query:           < 100ms
```

## Troubleshooting Quick Fixes

### Cache not working

```bash
# Frontend
localStorage.clear()
# DevTools > Application > Clear storage

# Backend
redis-cli FLUSHALL

# Check Redis connection
redis-cli ping
```

### Bundle too large

```bash
# Analyze
npx vite-bundle-visualizer

# Check for duplicates
npm dedupe

# Update vite.config.ts manual chunks
```

### Service worker issues

```javascript
// Unregister
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

### Database slow queries

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename = 'transactions';
```

## Key Files Reference

```
Frontend:
├── src/config/queryClient.ts          # React Query config
├── src/service-worker.ts              # Service worker
├── src/serviceWorkerRegistration.ts   # SW registration
├── src/hooks/useOptimisticUpdate.ts   # Optimistic updates
├── src/hooks/useCrud.ts               # CRUD with caching
├── src/utils/cache.ts                 # Cache utilities
└── vite.config.ts                     # Build config

Backend:
├── src/common/decorators/cache.decorator.ts     # Cache decorators
├── src/common/interceptors/cache.interceptor.ts # Cache interceptor
├── src/common/services/cache.service.ts         # Cache service
└── src/database/migrations/*-AddPerformanceIndexes.ts

Documentation:
├── CACHING_AND_PERFORMANCE.md         # Full documentation
├── IMPLEMENTATION_SUMMARY.md          # Implementation summary
├── QUICK_REFERENCE.md                 # This file
└── install-performance-deps.sh        # Installation script
```

## Additional Resources

- [Full Documentation](./CACHING_AND_PERFORMANCE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [React Query Docs](https://tanstack.com/query/latest)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [Redis Docs](https://redis.io/docs/)
