/**
 * Virtual Scrolling Utilities
 * Helper functions for optimizing virtual scrolling performance
 */

/**
 * Calculate the overscan count based on viewport size
 * Helps with smooth scrolling by rendering extra items
 */
export function calculateOverscan(viewportSize: number, itemSize: number): number {
  // Render 2-3 extra screens worth of content
  return Math.max(5, Math.ceil((viewportSize / itemSize) * 2));
}

/**
 * Debounce scroll events for better performance
 */
export function debounceScrollEvent<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle scroll events to maintain 60fps
 */
export function throttleScrollEvent<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 16
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Estimate item size for variable height items
 */
export function estimateSize(
  index: number,
  baseSize: number,
  sizeMap?: Map<number, number>
): number {
  if (sizeMap?.has(index)) {
    return sizeMap.get(index)!;
  }
  return baseSize;
}

/**
 * Calculate visible range with buffer
 */
export interface VisibleRange {
  start: number;
  end: number;
  overscanStart: number;
  overscanEnd: number;
}

export function calculateVisibleRange(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 5
): VisibleRange {
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.ceil((scrollTop + viewportHeight) / itemHeight);

  return {
    start: Math.max(0, start),
    end: Math.min(totalItems, end),
    overscanStart: Math.max(0, start - overscan),
    overscanEnd: Math.min(totalItems, end + overscan),
  };
}

/**
 * Measure element height for dynamic sizing
 */
export function measureElement(element: HTMLElement | null): number {
  if (!element) return 0;
  return element.getBoundingClientRect().height;
}

/**
 * Create stable keys for virtual items
 */
export function createVirtualKey(id: string | number, index: number): string {
  return `virtual-${id}-${index}`;
}

/**
 * Check if an index is in the visible range
 */
export function isInVisibleRange(
  index: number,
  visibleRange: VisibleRange
): boolean {
  return (
    index >= visibleRange.overscanStart && index <= visibleRange.overscanEnd
  );
}

/**
 * Performance measurement utilities
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();

  start(_label: string): number {
    return performance.now();
  }

  end(label: string, startTime: number): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }

    this.measurements.get(label)!.push(duration);

    // Keep only last 100 measurements
    const measures = this.measurements.get(label)!;
    if (measures.length > 100) {
      measures.shift();
    }
  }

  getAverage(label: string): number {
    const measures = this.measurements.get(label);
    if (!measures || measures.length === 0) return 0;

    const sum = measures.reduce((acc, val) => acc + val, 0);
    return sum / measures.length;
  }

  getMetrics(label: string) {
    const measures = this.measurements.get(label);
    if (!measures || measures.length === 0) {
      return { avg: 0, min: 0, max: 0, p95: 0, count: 0 };
    }

    const sorted = [...measures].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[p95Index],
      count: sorted.length,
    };
  }

  clear(): void {
    this.measurements.clear();
  }

  log(label: string): void {
    const metrics = this.getMetrics(label);
    console.log(`[Performance: ${label}]`, metrics);
  }
}

/**
 * Memory monitoring utilities
 */
export function estimateMemoryUsage(itemCount: number, avgItemSize: number = 1024): number {
  // Estimate in MB
  return (itemCount * avgItemSize) / (1024 * 1024);
}

/**
 * Scroll to index helper
 */
export function scrollToIndex(
  index: number,
  itemHeight: number,
  container: HTMLElement | null,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (!container) return;

  const targetScrollTop = index * itemHeight;
  container.scrollTo({
    top: targetScrollTop,
    behavior,
  });
}

/**
 * Get scroll progress (0-1)
 */
export function getScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / maxScroll));
}

/**
 * Check if near bottom (for infinite scroll)
 */
export function isNearBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold: number = 100
): boolean {
  const scrollBottom = scrollTop + clientHeight;
  return scrollHeight - scrollBottom < threshold;
}
