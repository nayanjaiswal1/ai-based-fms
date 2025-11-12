import { FilterConfig } from '@components/filters';

export const getTransactionFilters = (
  accounts: any[],
  categories: any[],
  tags: any[]
): FilterConfig[] => [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: [
      { label: 'Income', value: 'income' },
      { label: 'Expense', value: 'expense' },
    ],
  },
  {
    key: 'accountId',
    label: 'Account',
    type: 'select',
    placeholder: 'All Accounts',
    options: accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
  },
  {
    key: 'categoryId',
    label: 'Category',
    type: 'select',
    placeholder: 'All Categories',
    options: categories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
  },
  {
    key: 'tagId',
    label: 'Tag',
    type: 'select',
    placeholder: 'All Tags',
    options: tags.map((tag) => ({
      label: tag.name,
      value: tag.id,
    })),
  },
];
