import { ReactNode, useId } from 'react';

export interface ColumnConfig<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  /**
   * Description for screen readers
   */
  ariaLabel?: string;
}

export interface DataTableProps<T = any> {
  columns: ColumnConfig<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectAll?: () => void;
  onSelectOne?: (id: string) => void;
  actions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T = any>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  selectable = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  actions,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const tableId = useId();
  const captionId = useId();

  return (
    <div
      className={`overflow-hidden rounded-lg bg-card shadow transition-colors ${className}`}
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
    >
      <table
        id={tableId}
        className="min-w-full divide-y divide-border"
        role="table"
        aria-busy={loading}
        aria-live="polite"
      >
        <caption id={captionId} className="sr-only">
          Data table with {data.length} rows
        </caption>
        <thead className="bg-muted" role="rowgroup">
          <tr role="row">
            {selectable && onSelectAll && (
              <th scope="col" className="px-6 py-3 text-left" role="columnheader">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                role="columnheader"
                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
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
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card" role="rowgroup">
          {loading ? (
            <tr role="row">
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="px-6 py-12 text-center text-muted-foreground"
                role="cell"
              >
                <span role="status" aria-live="polite">
                  Loading...
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr role="row">
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="px-6 py-12 text-center text-muted-foreground"
                role="cell"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  role="row"
                  aria-rowindex={rowIndex + 2}
                  aria-selected={selectable ? isSelected : undefined}
                  className={`transition-colors hover:bg-accent ${onRowClick ? 'cursor-pointer' : ''} ${
                    isSelected ? 'bg-accent/50' : ''
                  }`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                >
                  {selectable && onSelectOne && (
                    <td className="px-6 py-4" role="cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectOne(id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    const content = column.render ? column.render(value, row) : value;

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
                    <td
                      className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"
                      role="cell"
                    >
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                        role="group"
                        aria-label="Row actions"
                      >
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
