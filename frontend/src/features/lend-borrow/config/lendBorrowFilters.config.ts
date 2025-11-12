import { FilterConfig } from '@components/filters';

export const getLendBorrowFilters = (): FilterConfig[] => [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All',
    options: [
      { label: 'Lent', value: 'lent' },
      { label: 'Borrowed', value: 'borrowed' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Partial', value: 'partial' },
      { label: 'Paid', value: 'paid' },
    ],
  },
];
