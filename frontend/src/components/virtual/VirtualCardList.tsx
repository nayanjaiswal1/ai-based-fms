import { ReactNode, useCallback } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { EmptyState } from './VirtualScrollContainer';

export interface VirtualCardListProps<T = any> {
  /**
   * Array of items to render
   */
  items: T[];

  /**
   * Render function for each card
   */
  renderCard: (item: T, index: number) => ReactNode;

  /**
   * Key extractor for items
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Estimated card height
   */
  cardHeight?: number;

  /**
   * Container height (use '100vh' for full screen mobile)
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
   * Additional CSS classes for container
   */
  className?: string;

  /**
   * Additional CSS classes for each card
   */
  cardClassName?: string;

  /**
   * Enable dynamic card heights
   */
  enableDynamicSize?: boolean;

  /**
   * Overscan count (number of cards to render outside viewport)
   */
  overscan?: number;

  /**
   * Gap between cards in pixels
   */
  gap?: number;

  /**
   * Callback when card is clicked
   */
  onCardClick?: (item: T, index: number) => void;

  /**
   * Enable card selection
   */
  selectable?: boolean;

  /**
   * Selected item IDs
   */
  selectedIds?: string[];

  /**
   * Callback when card is selected
   */
  onSelectCard?: (id: string) => void;

  /**
   * ARIA label
   */
  ariaLabel?: string;
}

/**
 * Virtual card list component optimized for mobile views
 * Renders cards with smooth scrolling for large datasets
 */
export function VirtualCardList<T = any>({
  items,
  renderCard,
  keyExtractor,
  cardHeight = 120,
  height = 'calc(100vh - 200px)',
  loading = false,
  emptyMessage = 'No items to display',
  className = '',
  cardClassName = '',
  overscan = 5,
  gap = 12,
  onCardClick,
  selectable = false,
  selectedIds = [],
  ariaLabel,
}: VirtualCardListProps<T>) {
  const {
    parentRef,
    virtualItems,
    totalSize,
  } = useVirtualScroll({
    items,
    estimateSize: cardHeight + gap,
    overscan,
    enableDynamicSize: false, // Disable dynamic sizing for cards
  });

  const handleCardClick = useCallback(
    (item: T, index: number) => {
      onCardClick?.(item, index);
    },
    [onCardClick]
  );

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <div className={`rounded-lg bg-gray-50 ${className}`} style={{ height }}>
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
      <div className={`rounded-lg bg-gray-50 ${className}`} style={{ height }}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      role="list"
      aria-label={ariaLabel}
    >
      <div
        className="relative"
        style={{
          height: `${totalSize}px`,
          paddingTop: `${gap / 2}px`,
          paddingBottom: `${gap / 2}px`,
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = keyExtractor(item, virtualItem.index);
          const isSelected = selectedIds.includes(key);

          return (
            <div
              key={key}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                paddingBottom: `${gap}px`,
              }}
              onClick={() => handleCardClick(item, virtualItem.index)}
              role="listitem"
              aria-selected={selectable ? isSelected : undefined}
            >
              <div
                className={`
                  ${cardClassName}
                  ${selectable ? 'cursor-pointer' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  transition-all
                `}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        handleSelectCard(item, virtualItem.index);
                      }
                    : undefined
                }
              >
                {renderCard(item, virtualItem.index)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Virtual card grid component (for tablet/desktop responsive views)
 */
export interface VirtualCardGridProps<T = any> extends VirtualCardListProps<T> {
  /**
   * Number of columns
   */
  columns?: number;

  /**
   * Responsive columns configuration
   */
  responsiveColumns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Virtual card grid with responsive columns
 */
export function VirtualCardGrid<T = any>({
  items,
  renderCard,
  keyExtractor,
  columns = 1,
  responsiveColumns,
  cardHeight = 120,
  height = 'calc(100vh - 200px)',
  loading = false,
  emptyMessage = 'No items to display',
  className = '',
  cardClassName = '',
  overscan = 5,
  gap = 16,
  onCardClick,
  selectable = false,
  selectedIds = [],
  ariaLabel,
}: VirtualCardGridProps<T>) {
  // Calculate row height based on columns
  const rowHeight = cardHeight + gap;
  const itemsPerRow = columns;

  // Group items into rows
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  const {
    parentRef,
    virtualItems,
    totalSize,
  } = useVirtualScroll({
    items: rows,
    estimateSize: rowHeight,
    overscan,
    enableDynamicSize: false, // Disable dynamic sizing for grid
  });

  const handleCardClick = useCallback(
    (item: T, index: number) => {
      onCardClick?.(item, index);
    },
    [onCardClick]
  );

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <div className={`rounded-lg bg-gray-50 ${className}`} style={{ height }}>
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
      <div className={`rounded-lg bg-gray-50 ${className}`} style={{ height }}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  // Determine grid classes based on responsive config
  const gridClasses = responsiveColumns
    ? `grid gap-${gap / 4}
       grid-cols-${responsiveColumns.sm || 1}
       sm:grid-cols-${responsiveColumns.md || 2}
       md:grid-cols-${responsiveColumns.lg || 3}
       lg:grid-cols-${responsiveColumns.xl || 4}`
    : `grid gap-${gap / 4} grid-cols-${columns}`;

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      role="list"
      aria-label={ariaLabel}
    >
      <div
        className="relative"
        style={{
          height: `${totalSize}px`,
          padding: `${gap / 2}px`,
        }}
      >
        {virtualItems.map((virtualItem) => {
          const row = rows[virtualItem.index];
          if (!row) return null;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className={gridClasses}>
                {row.map((item, colIndex) => {
                  const itemIndex = virtualItem.index * itemsPerRow + colIndex;
                  const key = keyExtractor(item, itemIndex);
                  const isSelected = selectedIds.includes(key);

                  return (
                    <div
                      key={key}
                      className={`
                        ${cardClassName}
                        ${selectable ? 'cursor-pointer' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        transition-all
                      `}
                      onClick={() => handleCardClick(item, itemIndex)}
                      role="listitem"
                      aria-selected={selectable ? isSelected : undefined}
                    >
                      {renderCard(item, itemIndex)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualCardList;
