import { ColumnConfig } from '@components/table';

export const getImportPreviewColumns = (): ColumnConfig[] => [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: (value) => <span className="text-sm text-gray-900">{value}</span>,
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true,
    render: (value) => <span className="text-sm text-gray-900">{value}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    align: 'right',
    render: (value) => (
      <span className="text-sm text-gray-900">${Number(value).toFixed(2)}</span>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    render: (value) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          value === 'income'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {value}
      </span>
    ),
  },
];
