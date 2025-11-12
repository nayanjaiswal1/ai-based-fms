import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/**
 * Optimized React Query configuration with:
 * - Per-data-type cache strategies
 * - Smart invalidation
 * - Persistent cache
 * - Query deduplication
 * - Background refresh
 */

// Configure cache times based on data volatility
export const CACHE_CONFIG = {
  // Real-time data - shorter cache
  transactions: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  },
  accounts: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  },
  // Analytics - medium cache
  dashboard: {
    staleTime: 1000 * 60 * 3, // 3 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
  },
  analytics: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  },
  insights: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  },
  // Static-ish data - longer cache
  budgets: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  },
  categories: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
  },
  tags: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
  },
  // User settings - long cache
  settings: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 120, // 2 hours
  },
} as const;

// Error handler for failed queries
const handleQueryError = (error: Error) => {
  console.error('Query error:', error);
  // Could integrate with error tracking service here
};

// Success handler for mutations
const handleMutationError = (error: Error) => {
  console.error('Mutation error:', error);
  // Could show toast notification here
};

// Query cache with global error handling
const queryCache = new QueryCache({
  onError: handleQueryError,
});

// Mutation cache with global error handling
const mutationCache = new MutationCache({
  onError: handleMutationError,
});

// Create optimized query client
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Default cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: false, // Disable aggressive refetching
      refetchOnReconnect: true, // Refetch when coming back online
      refetchOnMount: true, // Refetch on component mount

      // Network mode
      networkMode: 'offlineFirst', // Use cache when offline

      // Query deduplication
      structuralSharing: true, // Prevent unnecessary re-renders

      // Suspense support
      suspense: false,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      retryDelay: 1000,

      // Network mode
      networkMode: 'offlineFirst',
    },
  },
});

// Configure persistent cache (localStorage)
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'fms-query-cache',
  throttleTime: 1000, // Throttle writes to localStorage
});

// Persist query client to localStorage
export const persistOptions = {
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: 'v1', // Increment to invalidate all persisted cache
  dehydrateOptions: {
    // Only persist successful queries
    shouldDehydrateQuery: (query: any) => {
      return query.state.status === 'success';
    },
  },
};

// Initialize persistence
if (typeof window !== 'undefined') {
  persistQueryClient(persistOptions);
}

/**
 * Get cache config for a specific query key
 */
export function getCacheConfig(queryKey: string) {
  // Extract the base key
  const baseKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;

  // Return specific config or default
  return CACHE_CONFIG[baseKey as keyof typeof CACHE_CONFIG] || {
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  };
}

/**
 * Invalidate related queries
 * Smart invalidation to minimize unnecessary refetches
 */
export function invalidateRelatedQueries(
  queryClient: QueryClient,
  mutationType: 'transaction' | 'account' | 'budget' | 'category',
) {
  switch (mutationType) {
    case 'transaction':
      // Invalidate transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Balance changes
      queryClient.invalidateQueries({ queryKey: ['budgets'] }); // Spending changes
      break;

    case 'account':
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      break;

    case 'budget':
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      break;

    case 'category':
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      break;
  }
}

/**
 * Prefetch common data
 * Use this for navigation patterns
 */
export async function prefetchDashboardData(queryClient: QueryClient, api: any) {
  // Prefetch in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['dashboard'],
      queryFn: api.getDashboard,
      staleTime: CACHE_CONFIG.dashboard.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: ['accounts'],
      queryFn: api.getAccounts,
      staleTime: CACHE_CONFIG.accounts.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: ['transactions', { limit: 10 }],
      queryFn: () => api.getTransactions({ limit: 10 }),
      staleTime: CACHE_CONFIG.transactions.staleTime,
    }),
  ]);
}

/**
 * Clear all cache
 */
export function clearAllCache(queryClient: QueryClient) {
  queryClient.clear();
  localStorage.removeItem('fms-query-cache');
}

export default queryClient;
