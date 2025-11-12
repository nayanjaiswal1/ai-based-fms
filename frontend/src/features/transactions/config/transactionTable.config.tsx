import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { ColumnConfig } from '@components/table';

export const getTransactionColumns = (
  getCategoryName: (id: string) => string,
  getAccountName: (id: string) => string,
  onEdit: (transaction: any) => void,
  onDelete: (id: string) => void
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
        <div className="text-sm font-medium text-gray-900">{value}</div>
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
    width: '100px',
  },
];
