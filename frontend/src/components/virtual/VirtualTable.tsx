import { ReactNode, useCallback, useMemo, useId } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { VirtualTableRow } from './VirtualRow';
import { LoadingIndicator, EmptyState } from './VirtualScrollContainer';

export interface VirtualTableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  ariaLabel?: string;
}

export interface VirtualTableProps<T = any> {
  /**
   * Column configuration
   */
  columns: VirtualTableColumn<T>[];

  /**
   * Data array
   */
  data: T[];

  /**
   * Function to extract unique key from row
   */
  keyExtractor: (row: T, index: number) => string;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Empty message when no data
   */
  emptyMessage?: string;

  /**
   * Row height in pixels (for consistent sizing)
   */
  rowHeight?: number;

  /**
   * Enable row selection
   */
  selectable?: boolean;

  /**
   * Selected row IDs
   */
  selectedIds?: string[];

  /**
   * Callback when select all is clicked
   */
  onSelectAll?: () => void;

  /**
   * Callback when a single row is selected
   */
  onSelectOne?: (id: string) => void;

  /**
   * Actions column renderer
   */
  actions?: (row: T, index: number) => ReactNode;

  /**
   * Callback when row is clicked
   */
  onRowClick?: (row: T, index: number) => void;

  /**
   * Container height
   */
  height?: string | number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Enable dynamic row heights
   */
  enableDynamicSize?: boolean;

  /**
   * Overscan count for smoother scrolling
   */
  overscan?: number;

  /**
   * Show loading indicator at bottom
   */
  showLoadingIndicator?: boolean;

  /**
   * Has more items to load
   */
  hasMore?: boolean;
}

/**
 * High-performance virtual table component
 * Renders only visible rows for optimal performance with large datasets
 */
export function VirtualTable<T = any>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  rowHeight = 65,
  selectable = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  actions,
  onRowClick,
  height = '600px',
  className = '',
  enableDynamicSize = false,
  overscan = 5,
  showLoadingIndicator = false,
  hasMore = false,
}: VirtualTableProps<T>) {
  const tableId = useId();
  const captionId = useId();

  // Setup virtual scrolling
  const {
    parentRef,
    virtualItems,
    totalSize,
  } = useVirtualScroll({
    items: data,
    estimateSize: rowHeight,
    overscan,
    enableDynamicSize: false, // Disable dynamic sizing for table rows
  });

  // Check if all items are selected
  const isAllSelected = useMemo(() => {
    return data.length > 0 && selectedIds.length === data.length;
  }, [data.length, selectedIds.length]);

  // Handle row selection
  const handleSelectRow = useCallback(
    (row: T, index: number) => {
      const id = keyExtractor(row, index);
      onSelectOne?.(id);
    },
    [keyExtractor, onSelectOne]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (row: T, index: number) => {
      onRowClick?.(row, index);
    },
    [onRowClick]
  );

  // Render loading state
  if (loading && data.length === 0) {
    return (
      <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!loading && data.length === 0) {
    return (
      <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow ${className}`}
      role="region"
      aria-labelledby={captionId}
    >
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <table id={tableId} className="min-w-full" role="table">
          <caption id={captionId} className="sr-only">
            Data table with {data.length} rows
          </caption>
          <thead role="rowgroup">
            <tr role="row">
              {selectable && onSelectAll && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left w-12"
                  role="columnheader"
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  role="columnheader"
                  className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
                    column.align === 'right'
                      ? 'text-right'
                      : column.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                  aria-label={column.ariaLabel || column.label}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th
                  scope="col"
                  role="columnheader"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtual Scrolling Area */}
      <div
        ref={parentRef}
        className="overflow-auto relative"
        style={{ height }}
        role="rowgroup"
      >
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200 bg-white relative" style={{ height: `${totalSize}px` }}>
            {virtualItems.map((virtualItem) => {
              const item = data[virtualItem.index];
              const id = keyExtractor(item, virtualItem.index);
              const isSelected = selectedIds.includes(id);

              return (
                <VirtualTableRow
                  key={virtualItem.key}
                  virtualItem={virtualItem}
                  item={item}
                  index={virtualItem.index}
                  columns={columns}
                  actions={actions}
                  selectable={selectable}
                  isSelected={isSelected}
                  onSelect={handleSelectRow}
                  onClick={onRowClick ? handleRowClick : undefined}
                />
              );
            })}
          </tbody>
        </table>

        {/* Loading Indicator */}
        {showLoadingIndicator && (
          <div className="absolute bottom-0 left-0 right-0">
            <LoadingIndicator isLoading={loading} hasMore={hasMore} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualTable;
