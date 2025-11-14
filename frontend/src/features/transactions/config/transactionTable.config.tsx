import { format } from 'date-fns';
import { Edit, Trash2, GitMerge, Undo, History, ExternalLink } from 'lucide-react';
import { ColumnConfig } from '@components/table';

export const getTransactionColumns = (
  getCategoryName: (id: string) => string,
  getAccountName: (id: string) => string,
  onEdit: (transaction: any) => void,
  onDelete: (id: string) => void,
  onHistory?: (transaction: any) => void,
  onUnmerge?: (id: string) => void,
  getMergedCount?: (id: string) => Promise<number>
): ColumnConfig[] => [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: (value) => format(new Date(value), 'MMM dd, yyyy'),
    width: '120px',
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-900">{value}</div>
          {row.sourceType && row.sourceType !== 'manual' && row.sourceId && (
            <ExternalLink
              className="w-3 h-3 text-blue-500"
              title="Click to view source"
            />
          )}
          {row.lineItems && row.lineItems.length > 0 && (
            <span
              className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
              title={`${row.lineItems.length} items`}
            >
              {row.lineItems.length} items
            </span>
          )}
          {row.isMerged && (
            <span
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
              title="This transaction has been merged"
            >
              Merged
            </span>
          )}
          {row.mergedIntoId && (
            <span
              className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
              title="Part of merged transaction"
            >
              Merged Into
            </span>
          )}
        </div>
        {row.notes && <div className="text-sm text-gray-500">{row.notes}</div>}
      </div>
    ),
  },
  {
    key: 'categoryId',
    label: 'Category',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-gray-500">{getCategoryName(value)}</span>
    ),
    width: '150px',
  },
  {
    key: 'accountId',
    label: 'Account',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-gray-500">{getAccountName(value)}</span>
    ),
    width: '150px',
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    align: 'right',
    render: (value, row) => (
      <span
        className={`text-sm font-semibold ${
          row.type === 'income' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {row.type === 'income' ? '+' : '-'}${Number(value).toFixed(2)}
      </span>
    ),
    width: '120px',
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'right',
    render: (_, row) => (
      <div className="flex justify-end gap-2">
        {row.isMerged && onUnmerge && (
          <button
            onClick={() => onUnmerge(row.id)}
            className="text-orange-600 hover:text-orange-900"
            title="Unmerge this transaction"
          >
            <Undo className="h-4 w-4" />
          </button>
        )}
        {onHistory && (
          <button
            onClick={() => onHistory(row)}
            className="text-purple-600 hover:text-purple-900"
            title="View transaction history"
          >
            <History className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onEdit(row)}
          className="text-blue-600 hover:text-blue-900"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(row.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
    width: '180px',
  },
];
