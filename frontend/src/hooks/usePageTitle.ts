import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/new': 'New Transaction',
  '/transactions/duplicates': 'Duplicate Transactions',
  '/accounts': 'Accounts',
  '/reconciliation': 'Reconciliation',
  '/budgets': 'Budgets',
  '/groups': 'Groups',
  '/investments': 'Investments',
  '/lend-borrow': 'Lend & Borrow',
  '/analytics': 'Analytics & Reports',
  '/insights': 'Insights',
  '/reports': 'Reports',
  '/ai': 'AI Assistant',
  '/import': 'Import',
  '/email': 'Email Integration',
  '/notifications': 'Notifications',
  '/activity-log': 'Activity Log',
  '/admin/jobs': 'Job Monitoring',
  '/settings': 'Settings',
  '/settings/appearance': 'Settings',
  '/settings/categories': 'Settings',
  '/settings/tags': 'Settings',
  '/settings/reminders': 'Settings',
  '/settings/export': 'Settings',
  '/settings/oauth': 'Settings',
  '/settings/security': 'Settings',
  '/settings/sessions': 'Settings',
  '/settings/privacy': 'Settings',
};

export function usePageTitle(): string {
  const location = useLocation();

  // Check for exact match first
  if (PAGE_TITLES[location.pathname]) {
    return PAGE_TITLES[location.pathname];
  }

  // Check for pattern matches (e.g., /transactions/edit/:id)
  if (location.pathname.startsWith('/transactions/edit/')) {
    return 'Edit Transaction';
  }
  if (location.pathname.startsWith('/accounts/edit/')) {
    return 'Edit Account';
  }
  if (location.pathname.startsWith('/budgets/edit/')) {
    return 'Edit Budget';
  }
  if (location.pathname.startsWith('/groups/edit/')) {
    return 'Edit Group';
  }
  if (location.pathname.startsWith('/investments/edit/')) {
    return 'Edit Investment';
  }
  if (location.pathname.startsWith('/lend-borrow/edit/')) {
    return 'Edit Lend/Borrow';
  }
  if (location.pathname.startsWith('/reconciliation/')) {
    return 'Reconciliation';
  }

  // Default fallback
  return 'FMS';
}
