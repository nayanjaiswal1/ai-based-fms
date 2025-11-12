import { ReactNode } from 'react';

export interface ColumnConfig<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
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

  return (
    <div className={`overflow-hidden rounded-lg bg-card shadow transition-colors ${className}`}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {selectable && onSelectAll && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                } ${column.className || ''}`}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="px-6 py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  className={`transition-colors hover:bg-accent ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable && onSelectOne && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectOne(id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    const content = column.render ? column.render(value, row) : value;

                    return (
                      <td
                        key={column.key}
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
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
