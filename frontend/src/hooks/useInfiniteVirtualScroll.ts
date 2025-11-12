import { useEffect, useCallback, useRef, useState } from 'react';
import { useVirtualScroll, UseVirtualScrollOptions } from './useVirtualScroll';

export interface UseInfiniteVirtualScrollOptions<T = any> extends UseVirtualScrollOptions<T> {
  /**
   * Function to load more items
   */
  onLoadMore: () => Promise<void> | void;

  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Whether currently loading more items
   */
  isLoading?: boolean;

  /**
   * Distance from bottom to trigger load (in pixels)
   */
  threshold?: number;

  /**
   * Enable automatic loading when scrolling near bottom
   */
  autoLoad?: boolean;

  /**
   * Prefetch next page when this percentage is reached (0-1)
   */
  prefetchThreshold?: number;
}

/**
 * Custom hook combining virtual scrolling with infinite scroll
 * Perfect for large datasets that need pagination
 */
export function useInfiniteVirtualScroll<T = any>(
  options: UseInfiniteVirtualScrollOptions<T>
) {
  const {
    onLoadMore,
    hasMore,
    isLoading = false,
    threshold = 500,
    autoLoad = true,
    prefetchThreshold = 0.8,
    ...virtualScrollOptions
  } = options;

  const [isPrefetching, setIsPrefetching] = useState(false);
  const loadingRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  // Use base virtual scroll hook
  const virtualScroll = useVirtualScroll({
    ...virtualScrollOptions,
    onScroll: (offset) => {
      lastScrollTopRef.current = offset;
      virtualScrollOptions.onScroll?.(offset);
    },
  });

  const { parentRef, isAtBottom, scrollProgress } = virtualScroll;

  /**
   * Load more items
   */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || isLoading) {
      return;
    }

    try {
      loadingRef.current = true;
      await onLoadMore();
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, isLoading, onLoadMore]);

  /**
   * Check if should load more based on scroll position
   */
  const checkShouldLoad = useCallback(() => {
    if (!autoLoad || !parentRef.current || !hasMore || isLoading) {
      return false;
    }

    const container = parentRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Calculate distance from bottom
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    return distanceFromBottom < threshold;
  }, [autoLoad, parentRef, hasMore, isLoading, threshold]);

  /**
   * Check if should prefetch
   */
  const checkShouldPrefetch = useCallback(() => {
    if (!hasMore || isLoading || isPrefetching) {
      return false;
    }

    return scrollProgress >= prefetchThreshold;
  }, [hasMore, isLoading, isPrefetching, scrollProgress, prefetchThreshold]);

  /**
   * Handle scroll with load more check
   */
  useEffect(() => {
    if (!parentRef.current || !autoLoad) return;

    const container = parentRef.current;

    const handleScroll = () => {
      // Load more if near bottom
      if (checkShouldLoad()) {
        loadMore();
      }

      // Prefetch if threshold reached
      if (checkShouldPrefetch() && !isPrefetching) {
        setIsPrefetching(true);
        loadMore().finally(() => setIsPrefetching(false));
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', throttledScroll);
    };
  }, [
    parentRef,
    autoLoad,
    checkShouldLoad,
    checkShouldPrefetch,
    loadMore,
    isPrefetching,
  ]);

  /**
   * Check if at bottom on initial render or item changes
   */
  useEffect(() => {
    if (isAtBottom && hasMore && !isLoading && autoLoad) {
      loadMore();
    }
  }, [isAtBottom, hasMore, isLoading, autoLoad, loadMore]);

  /**
   * Manually trigger load more
   */
  const triggerLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  /**
   * Scroll to top helper
   */
  const scrollToTop = useCallback(() => {
    virtualScroll.scrollToOffset(0, { smooth: true });
  }, [virtualScroll]);

  /**
   * Scroll to bottom helper
   */
  const scrollToBottom = useCallback(() => {
    virtualScroll.scrollToOffset(virtualScroll.totalSize, { smooth: true });
  }, [virtualScroll]);

  return {
    ...virtualScroll,

    // Infinite scroll specific
    loadMore: triggerLoadMore,
    hasMore,
    isLoading,
    isPrefetching,
    scrollToTop,
    scrollToBottom,

    // Status
    canLoadMore: hasMore && !isLoading,
    isLoadingMore: isLoading || isPrefetching,
  };
}

/**
 * Hook for cursor-based pagination with virtual scrolling
 */
export function useCursorVirtualScroll<T = any>(
  options: Omit<UseInfiniteVirtualScrollOptions<T>, 'onLoadMore'> & {
    onLoadMore: (cursor: string | null) => Promise<{
      items: T[];
      nextCursor: string | null;
    }>;
  }
) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<T[]>(options.items || []);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const result = await options.onLoadMore(cursor);
      setAllItems((prev) => [...prev, ...result.items]);
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, options]);

  const virtualScroll = useInfiniteVirtualScroll({
    ...options,
    items: allItems,
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const reset = useCallback(() => {
    setCursor(null);
    setAllItems([]);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  return {
    ...virtualScroll,
    reset,
    cursor,
    allItems,
  };
}
