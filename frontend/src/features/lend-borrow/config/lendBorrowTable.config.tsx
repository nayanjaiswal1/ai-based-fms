import { format } from 'date-fns';
import { Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ColumnConfig } from '@components/table';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'partial':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'pending':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'text-green-600';
    case 'partial':
      return 'text-yellow-600';
    case 'pending':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getLendBorrowColumns = (
  onEdit: (record: any) => void,
  onDelete: (id: string) => void,
  onRecordPayment: (record: any) => void
): ColumnConfig[] => [
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    render: (value) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          value === 'lent'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {value}
      </span>
    ),
    width: '100px',
  },
  {
    key: 'personName',
    label: 'Person',
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
        {row.description && <div className="text-sm text-gray-500">{row.description}</div>}
      </div>
    ),
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-gray-900">${Number(value).toFixed(2)}</span>
    ),
    width: '120px',
  },
  {
    key: 'paidAmount',
    label: 'Paid',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-gray-900">${Number(value).toFixed(2)}</span>
    ),
    width: '120px',
  },
  {
    key: 'remaining',
    label: 'Remaining',
    sortable: true,
    render: (_, row) => {
      const remaining = row.amount - row.paidAmount;
      return <span className="text-sm font-semibold text-gray-900">${remaining.toFixed(2)}</span>;
    },
    width: '120px',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        {getStatusIcon(value)}
        <span className={`text-sm font-medium capitalize ${getStatusColor(value)}`}>
          {value}
        </span>
      </div>
    ),
    width: '120px',
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-gray-500">
        {value ? format(new Date(value), 'MMM dd, yyyy') : 'No due date'}
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
        {row.status !== 'paid' && (
          <button
            onClick={() => onRecordPayment(row)}
            className="text-sm text-green-600 hover:text-green-900"
          >
            Record Payment
          </button>
        )}
        <button
          onClick={() => onEdit(row)}
          className="text-blue-600 hover:text-blue-900"
        >
          <Edit className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(row.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="inline h-4 w-4" />
        </button>
      </div>
    ),
    width: '200px',
  },
];
