import React, { memo, CSSProperties, ReactNode } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';

export interface VirtualRowProps<T = any> {
  /**
   * Virtual item from react-virtual
   */
  virtualItem: VirtualItem;

  /**
   * Actual data item
   */
  item: T;

  /**
   * Index in the full list
   */
  index: number;

  /**
   * Render function for the row content
   */
  children: (item: T, index: number) => ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional styles
   */
  style?: CSSProperties;

  /**
   * Whether the row is selected
   */
  isSelected?: boolean;

  /**
   * Callback when row is clicked
   */
  onClick?: (item: T, index: number) => void;

  /**
   * Callback when row is double-clicked
   */
  onDoubleClick?: (item: T, index: number) => void;

  /**
   * Enable keyboard navigation
   */
  tabIndex?: number;

  /**
   * ARIA role
   */
  role?: string;

  /**
   * ARIA label
   */
  ariaLabel?: string;

  /**
   * Whether to measure this element for dynamic sizing
   */
  measureElement?: (element: HTMLElement | null) => void;
}

/**
 * Memoized virtual row component for optimal performance
 * Only re-renders when props change
 */
function VirtualRowComponent<T = any>({
  virtualItem,
  item,
  index,
  children,
  className = '',
  style = {},
  isSelected = false,
  onClick,
  onDoubleClick,
  tabIndex,
  role = 'listitem',
  ariaLabel,
  measureElement,
}: VirtualRowProps<T>) {
  const rowStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${virtualItem.start}px)`,
    ...style,
  };

  const handleClick = () => {
    if (onClick) {
      onClick(item, index);
    }
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(item, index);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(item, index);
    }
  };

  return (
    <div
      ref={measureElement}
      data-index={virtualItem.index}
      className={`virtual-row ${isSelected ? 'selected' : ''} ${className}`}
      style={rowStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      aria-selected={isSelected}
    >
      {children(item, index)}
    </div>
  );
}

/**
 * Export memoized version with custom comparison
 */
export const VirtualRow = memo(
  VirtualRowComponent,
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.virtualItem.key === nextProps.virtualItem.key &&
      prevProps.virtualItem.start === nextProps.virtualItem.start &&
      prevProps.virtualItem.size === nextProps.virtualItem.size &&
      prevProps.item === nextProps.item &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.className === nextProps.className
    );
  }
) as typeof VirtualRowComponent;

/**
 * Table-specific virtual row
 */
export interface VirtualTableRowProps<T = any> {
  /**
   * Virtual item from react-virtual
   */
  virtualItem: VirtualItem;

  /**
   * Actual data item
   */
  item: T;

  /**
   * Index in the full list
   */
  index: number;

  /**
   * Columns configuration
   */
  columns: Array<{
    key: string;
    render?: (value: any, item: T, index: number) => ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }>;

  /**
   * Actions column content
   */
  actions?: (item: T, index: number) => ReactNode;

  /**
   * Whether row is selectable
   */
  selectable?: boolean;

  /**
   * Whether the row is selected
   */
  isSelected?: boolean;

  /**
   * Selection checkbox handler
   */
  onSelect?: (item: T, index: number) => void;

  /**
   * Callback when row is clicked
   */
  onClick?: (item: T, index: number) => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional styles
   */
  style?: CSSProperties;

  /**
   * Whether to measure this element for dynamic sizing
   */
  measureElement?: (element: HTMLElement | null) => void;
}

function VirtualTableRowComponent<T = any>({
  virtualItem,
  item,
  index,
  columns,
  actions,
  selectable,
  onSelect,
  isSelected,
  className = '',
  style = {},
  onClick,
  measureElement,
}: VirtualTableRowProps<T>) {
  const rowStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${virtualItem.start}px)`,
    ...style,
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(item, index);
    }
  };

  const handleRowClick = () => {
    if (onClick) {
      onClick(item, index);
    }
  };

  return (
    <tr
      ref={measureElement}
      data-index={virtualItem.index}
      className={`virtual-table-row ${isSelected ? 'selected bg-blue-50' : ''} ${className} hover:bg-gray-50 transition-colors`}
      style={rowStyle}
      onClick={handleRowClick}
      role="row"
      aria-selected={isSelected}
    >
      {selectable && (
        <td className="px-6 py-4" role="cell">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select row ${index + 1}`}
          />
        </td>
      )}

      {columns.map((column) => {
        const value = (item as any)[column.key];
        const content = column.render
          ? column.render(value, item, index)
          : value;

        return (
          <td
            key={column.key}
            role="cell"
            className={`px-6 py-4 ${
              column.align === 'right'
                ? 'text-right'
                : column.align === 'center'
                ? 'text-center'
                : 'text-left'
            } ${column.className || ''}`}
          >
            {content}
          </td>
        );
      })}

      {actions && (
        <td className="px-6 py-4 text-right" role="cell">
          <div
            className="flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {actions(item, index)}
          </div>
        </td>
      )}
    </tr>
  );
}

/**
 * Export memoized table row
 */
export const VirtualTableRow = memo(
  VirtualTableRowComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.virtualItem.key === nextProps.virtualItem.key &&
      prevProps.virtualItem.start === nextProps.virtualItem.start &&
      prevProps.virtualItem.size === nextProps.virtualItem.size &&
      prevProps.item === nextProps.item &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.columns === nextProps.columns
    );
  }
) as typeof VirtualTableRowComponent;
