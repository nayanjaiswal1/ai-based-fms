import { ReactNode, useCallback } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useInfiniteVirtualScroll } from '@/hooks/useInfiniteVirtualScroll';
import { VirtualRow } from './VirtualRow';
import {
  VirtualScrollContainer,
  LoadingIndicator,
  EmptyState,
  ScrollToTopButton,
} from './VirtualScrollContainer';

export interface VirtualListProps<T = any> {
  /**
   * Array of items to render
   */
  items: T[];

  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * Key extractor for items
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Estimated item height
   */
  itemHeight?: number;

  /**
   * Container height
   */
  height?: string | number;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Empty message
   */
  emptyMessage?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Overscan count
   */
  overscan?: number;

  /**
   * Callback when item is clicked
   */
  onItemClick?: (item: T, index: number) => void;

  /**
   * Callback when scroll position changes
   */
  onScroll?: (offset: number) => void;

  /**
   * Show scroll to top button
   */
  showScrollToTop?: boolean;

  /**
   * ARIA label
   */
  ariaLabel?: string;
}

/**
 * Generic virtual list component
 * Works with any type of data and custom rendering
 */
export function VirtualList<T = any>({
  items,
  renderItem,
  keyExtractor,
  itemHeight = 80,
  height = '600px',
  loading = false,
  emptyMessage = 'No items to display',
  className = '',
  overscan = 5,
  onItemClick,
  onScroll,
  showScrollToTop = true,
  ariaLabel,
}: VirtualListProps<T>) {
  const {
    parentRef,
    virtualItems,
    totalSize,
    scrollToOffset,
    isAtTop,
  } = useVirtualScroll({
    items,
    estimateSize: itemHeight,
    overscan,
    enableDynamicSize: false, // Disable dynamic sizing for list
    onScroll,
  });

  const scrollToTop = useCallback(() => {
    scrollToOffset(0, { smooth: true });
  }, [scrollToOffset]);

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      onItemClick?.(item, index);
    },
    [onItemClick]
  );

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <div className={`rounded-lg bg-white shadow ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!loading && items.length === 0) {
    return (
      <div className={`rounded-lg bg-white shadow ${className}`} style={{ height }}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <>
      <VirtualScrollContainer
        ref={parentRef}
        totalSize={totalSize}
        height={height}
        className={`rounded-lg bg-white shadow ${className}`}
        ariaLabel={ariaLabel}
        role="list"
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = keyExtractor(item, virtualItem.index);

          return (
            <VirtualRow
              key={key}
              virtualItem={virtualItem}
              item={item}
              index={virtualItem.index}
              onClick={onItemClick ? handleItemClick : undefined}
            >
              {renderItem}
            </VirtualRow>
          );
        })}
      </VirtualScrollContainer>

      {/* Scroll to top button */}
      {showScrollToTop && (
        <ScrollToTopButton onClick={scrollToTop} show={!isAtTop} />
      )}
    </>
  );
}

/**
 * Virtual list with infinite scrolling
 */
export interface InfiniteVirtualListProps<T = any> {
  /**
   * Items to render
   */
  items: T[];

  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * Key extractor for items
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Function to load more items
   */
  onLoadMore: () => Promise<void> | void;

  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Loading more state
   */
  isLoadingMore?: boolean;

  /**
   * Distance from bottom to trigger load
   */
  threshold?: number;

  /**
   * Estimated item height
   */
  itemHeight?: number;

  /**
   * Container height
   */
  height?: string | number;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Empty message
   */
  emptyMessage?: string;

  /**
   * Loading message
   */
  loadingMessage?: string;

  /**
   * End message
   */
  endMessage?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Overscan count
   */
  overscan?: number;

  /**
   * Callback when item is clicked
   */
  onItemClick?: (item: T, index: number) => void;

  /**
   * Callback when scroll position changes
   */
  onScroll?: (offset: number) => void;

  /**
   * Show scroll to top button
   */
  showScrollToTop?: boolean;

  /**
   * ARIA label
   */
  ariaLabel?: string;
}

/**
 * Virtual list with infinite scroll support
 */
export function InfiniteVirtualList<T = any>({
  items,
  renderItem,
  keyExtractor,
  onLoadMore,
  hasMore,
  isLoadingMore = false,
  threshold = 500,
  itemHeight = 80,
  height = '600px',
  loading = false,
  emptyMessage = 'No items to display',
  loadingMessage = 'Loading more...',
  endMessage = 'No more items',
  className = '',
  overscan = 5,
  onItemClick,
  onScroll,
  showScrollToTop = true,
  ariaLabel,
}: InfiniteVirtualListProps<T>) {
  const {
    parentRef,
    virtualItems,
    totalSize,
    scrollToTop,
    isAtTop,
    isLoadingMore: isInternalLoading,
  } = useInfiniteVirtualScroll({
    items,
    estimateSize: itemHeight,
    overscan,
    enableDynamicSize: false, // Disable dynamic sizing for infinite list
    onScroll,
    onLoadMore,
    hasMore,
    isLoading: isLoadingMore,
    threshold,
    autoLoad: true,
  });

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      onItemClick?.(item, index);
    },
    [onItemClick]
  );

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <div className={`rounded-lg bg-white shadow ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!loading && items.length === 0) {
    return (
      <div className={`rounded-lg bg-white shadow ${className}`} style={{ height }}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <>
      <VirtualScrollContainer
        ref={parentRef}
        totalSize={totalSize}
        height={height}
        className={`rounded-lg bg-white shadow ${className}`}
        ariaLabel={ariaLabel}
        role="list"
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = keyExtractor(item, virtualItem.index);

          return (
            <VirtualRow
              key={key}
              virtualItem={virtualItem}
              item={item}
              index={virtualItem.index}
              onClick={onItemClick ? handleItemClick : undefined}
            >
              {renderItem}
            </VirtualRow>
          );
        })}

        {/* Loading indicator at bottom */}
        <div style={{ position: 'absolute', top: `${totalSize}px`, width: '100%' }}>
          <LoadingIndicator
            isLoading={isLoadingMore || isInternalLoading}
            hasMore={hasMore}
            message={isLoadingMore ? loadingMessage : endMessage}
          />
        </div>
      </VirtualScrollContainer>

      {/* Scroll to top button */}
      {showScrollToTop && (
        <ScrollToTopButton onClick={scrollToTop} show={!isAtTop} />
      )}
    </>
  );
}

export default VirtualList;
