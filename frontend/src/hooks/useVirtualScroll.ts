import { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface UseVirtualScrollOptions<T = any> {
  /**
   * Array of items to virtualize
   */
  items: T[];

  /**
   * Estimated size of each item in pixels
   */
  estimateSize?: number;

  /**
   * Number of items to render outside the visible area
   */
  overscan?: number;

  /**
   * Enable horizontal scrolling
   */
  horizontal?: boolean;

  /**
   * Enable smooth scrolling
   */
  smooth?: boolean;

  /**
   * Callback when scroll position changes
   */
  onScroll?: (offset: number) => void;

  /**
   * Callback when items in view change
   */
  onRangeChange?: (start: number, end: number) => void;

  /**
   * Enable dynamic sizing (measure each item)
   */
  enableDynamicSize?: boolean;

  /**
   * Padding at start and end
   */
  paddingStart?: number;
  paddingEnd?: number;

  /**
   * Initial scroll offset
   */
  initialOffset?: number;

  /**
   * Key extractor for items
   */
  getItemKey?: (index: number) => string | number;
}

/**
 * Custom hook for virtual scrolling with performance optimizations
 */
export function useVirtualScroll<T = any>(options: UseVirtualScrollOptions<T>) {
  const {
    items,
    estimateSize = 50,
    overscan = 5,
    horizontal = false,
    smooth = true,
    onScroll,
    onRangeChange,
    enableDynamicSize = false,
    paddingStart = 0,
    paddingEnd = 0,
    initialOffset = 0,
    getItemKey,
  } = options;

  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<number>(0);

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
    paddingStart,
    paddingEnd,
    initialOffset,
    enabled: items.length > 0,
    ...(enableDynamicSize && {
      measureElement:
        typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
          ? (element) => element?.getBoundingClientRect().height ?? 0
          : undefined,
    }),
    onChange: (instance) => {
      // Track scroll events
      const offset = instance.scrollOffset ?? 0;

      // Debounce scroll callback
      if (onScroll) {
        clearTimeout(scrollingRef.current);
        scrollingRef.current = window.setTimeout(() => {
          onScroll(offset);
        }, 100);
      }

      // Notify range changes
      if (onRangeChange && instance.range) {
        onRangeChange(instance.range.startIndex, instance.range.endIndex);
      }
    },
  });

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems();

  // Calculate total size
  const totalSize = virtualizer.getTotalSize();

  // Scroll to index helper
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; smooth?: boolean }) => {
      virtualizer.scrollToIndex(index, {
        align: options?.align || 'start',
        behavior: options?.smooth !== false && smooth ? 'smooth' : 'auto',
      });
    },
    [virtualizer, smooth]
  );

  // Scroll to offset helper
  const scrollToOffset = useCallback(
    (offset: number, options?: { smooth?: boolean }) => {
      virtualizer.scrollToOffset(offset, {
        behavior: options?.smooth !== false && smooth ? 'smooth' : 'auto',
      });
    },
    [virtualizer, smooth]
  );

  // Get item by index
  const getItem = useCallback(
    (index: number): T | undefined => {
      return items[index];
    },
    [items]
  );

  // Check if index is visible
  const isItemVisible = useCallback(
    (index: number): boolean => {
      return virtualItems.some((item) => item.index === index);
    },
    [virtualItems]
  );

  // Get visible range
  const visibleRange = useMemo(() => {
    if (virtualItems.length === 0) {
      return { start: 0, end: 0 };
    }
    return {
      start: virtualItems[0].index,
      end: virtualItems[virtualItems.length - 1].index,
    };
  }, [virtualItems]);

  // Measure item (for dynamic sizing)
  const measureItem = useCallback(
    (index: number) => {
      virtualizer.measureElement(
        document.querySelector(`[data-index="${index}"]`) as HTMLElement
      );
    },
    [virtualizer]
  );

  // Get scroll progress (0-1)
  const scrollProgress = useMemo(() => {
    const offset = virtualizer.scrollOffset ?? 0;
    if (totalSize === 0) return 0;
    return Math.min(1, Math.max(0, offset / totalSize));
  }, [virtualizer.scrollOffset, totalSize]);

  // Check if scrolled to bottom
  const isAtBottom = useMemo(() => {
    if (!parentRef.current) return false;
    const offset = virtualizer.scrollOffset ?? 0;
    const clientHeight = parentRef.current.clientHeight;
    return offset + clientHeight >= totalSize - 10; // 10px threshold
  }, [virtualizer.scrollOffset, totalSize]);

  // Check if scrolled to top
  const isAtTop = useMemo(() => {
    const offset = virtualizer.scrollOffset ?? 0;
    return offset <= 10; // 10px threshold
  }, [virtualizer.scrollOffset]);

  return {
    // Refs
    parentRef,

    // Virtual items
    virtualItems,
    totalSize,
    visibleRange,

    // Scroll helpers
    scrollToIndex,
    scrollToOffset,
    scrollProgress,
    isAtBottom,
    isAtTop,

    // Item helpers
    getItem,
    isItemVisible,
    measureItem,

    // Raw virtualizer instance (for advanced usage)
    virtualizer,
  };
}

/**
 * Hook for variable size virtual scrolling
 */
export function useVariableSizeVirtualScroll<T = any>(
  options: UseVirtualScrollOptions<T> & {
    getItemSize: (index: number) => number;
  }
) {
  const { getItemSize, ...restOptions } = options;

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: restOptions.items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => getItemSize(index),
    overscan: restOptions.overscan || 5,
    horizontal: restOptions.horizontal || false,
    paddingStart: restOptions.paddingStart,
    paddingEnd: restOptions.paddingEnd,
    initialOffset: restOptions.initialOffset,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return {
    parentRef,
    virtualItems,
    totalSize,
    scrollToIndex: (index: number) => virtualizer.scrollToIndex(index),
    scrollToOffset: (offset: number) => virtualizer.scrollToOffset(offset),
    virtualizer,
  };
}
