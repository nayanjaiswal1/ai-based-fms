import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { FeatureGate } from '@/components/feature-gate';
import { FeatureFlag } from './features.config';
import { RedirectWithParams } from '@/components/RedirectWithParams';

// Lazy load pages
const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));
const TransactionsPage = lazy(() => import('@features/transactions/pages/TransactionsPage'));
const DuplicatesPage = lazy(() => import('@features/transactions/pages/DuplicatesPage'));
const AccountsPage = lazy(() => import('@features/accounts/pages/AccountsPage'));
const ReconciliationPage = lazy(() =>
  import('@features/reconciliation/pages/ReconciliationPage').then(module => ({
    default: module.ReconciliationPage
  }))
);
const BudgetsPage = lazy(() => import('@features/budgets/pages/BudgetsPage'));
const CreateBudgetPage = lazy(() => import('@features/budgets/pages/CreateBudgetPage'));
const AIBudgetWizardPage = lazy(() => import('@features/budgets/pages/AIBudgetWizardPage'));
const GroupsPage = lazy(() => import('@features/groups/pages/GroupsPage'));
const GroupDetailPage = lazy(() => import('@features/groups/pages/GroupDetailPage'));
const SharedExpensesPage = lazy(() => import('@features/shared-expenses/pages/SharedExpensesPage'));
const InvestmentsPage = lazy(() => import('@features/investments/pages/InvestmentsPage'));
const LendBorrowPage = lazy(() => import('@features/lend-borrow/pages/LendBorrowPage'));
const SharedFinancePage = lazy(() => import('@features/shared-finance/pages/SharedFinancePage'));
const CombinedAnalyticsPage = lazy(() => import('@features/analytics/pages/CombinedAnalyticsPage'));
const AIPage = lazy(() => import('@features/ai/pages/AIPage'));
const ImportPage = lazy(() => import('@features/import/pages/ImportPage'));
const EmailPage = lazy(() => import('@features/email/pages/EmailPage'));
const EmailCallbackPage = lazy(() => import('@features/email/pages/EmailCallbackPage'));
const NotificationsPage = lazy(() => import('@features/notifications/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@features/settings/pages/SettingsPage'));
const CategoryDetailPage = lazy(() => import('@features/settings/pages/CategoryDetailPage'));
const TagDetailPage = lazy(() => import('@features/settings/pages/TagDetailPage'));
const ActivityLogPage = lazy(() => import('@features/audit/pages/ActivityLogPage'));
const JobsPage = lazy(() => import('@features/admin/pages/JobsPage'));
const GoodbyePage = lazy(() => import('../pages/GoodbyePage'));

// Settings tab components
const AppearanceTab = lazy(() => import('@features/settings/components/AppearanceTab'));
const CategoriesTab = lazy(() => import('@features/settings/components/CategoriesTab'));
const TagsTab = lazy(() => import('@features/settings/components/TagsTab'));
const RemindersTab = lazy(() => import('@features/settings/components/RemindersTab'));
const ExportTab = lazy(() => import('@features/settings/components/ExportTab'));
const SecurityTab = lazy(() => import('@features/settings/components/SecurityTab'));
const SessionsTab = lazy(() => import('@features/settings/components/SessionsTab'));
const PrivacyTab = lazy(() => import('@features/settings/components/PrivacyTab'));

/**
 * Protected route configuration
 * These routes require authentication
 */
export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/transactions',
    element: <TransactionsPage />,
  },
  {
    path: '/transactions/new',
    element: <TransactionsPage />,
  },
  {
    path: '/transactions/edit/:id',
    element: <TransactionsPage />,
  },
  {
    path: '/transactions/duplicates',
    element: <DuplicatesPage />,
  },
  {
    path: '/accounts',
    element: <AccountsPage />,
  },
  {
    path: '/accounts/new',
    element: <AccountsPage />,
  },
  {
    path: '/accounts/edit/:id',
    element: <AccountsPage />,
  },
  {
    path: '/reconciliation',
    element: <ReconciliationPage />,
  },
  {
    path: '/reconciliation/:reconciliationId',
    element: <ReconciliationPage />,
  },
  {
    path: '/budgets',
    element: <BudgetsPage />,
  },
  {
    path: '/budgets/new',
    element: <CreateBudgetPage />,
  },
  {
    path: '/budgets/edit/:id',
    element: <BudgetsPage />,
  },
  {
    path: '/budgets/ai-wizard',
    element: <AIBudgetWizardPage />,
  },
  {
    path: '/shared-finance',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <SharedFinancePage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-finance/groups',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <SharedFinancePage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-finance/groups/new',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <GroupsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-finance/groups/:id',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <GroupDetailPage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-finance/lend-borrow',
    element: (
      <FeatureGate feature={FeatureFlag.LEND_BORROW}>
        <SharedFinancePage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-finance/lend-borrow/new',
    element: (
      <FeatureGate feature={FeatureFlag.LEND_BORROW}>
        <LendBorrowPage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-finance/lend-borrow/edit/:id',
    element: (
      <FeatureGate feature={FeatureFlag.LEND_BORROW}>
        <LendBorrowPage />
      </FeatureGate>
    ),
  },
  {
    path: '/shared-expenses',
    element: <SharedExpensesPage />,
  },
  {
    path: '/shared-expenses/:id',
    element: <SharedExpensesPage />,
  },
  {
    path: '/investments',
    element: (
      <FeatureGate feature={FeatureFlag.INVESTMENTS}>
        <InvestmentsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/investments/new',
    element: (
      <FeatureGate feature={FeatureFlag.INVESTMENTS}>
        <InvestmentsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/investments/edit/:id',
    element: (
      <FeatureGate feature={FeatureFlag.INVESTMENTS}>
        <InvestmentsPage />
      </FeatureGate>
    ),
  },
  // Backward compatibility redirects for old URLs
  {
    path: '/groups',
    element: <Navigate to="/shared-finance/groups" replace />,
  },
  {
    path: '/groups/new',
    element: <Navigate to="/shared-finance/groups/new" replace />,
  },
  {
    path: '/groups/:id',
    element: <RedirectWithParams to="/shared-finance/groups/:id" />,
  },
  {
    path: '/lend-borrow',
    element: <Navigate to="/shared-finance/lend-borrow" replace />,
  },
  {
    path: '/lend-borrow/new',
    element: <Navigate to="/shared-finance/lend-borrow/new" replace />,
  },
  {
    path: '/lend-borrow/edit/:id',
    element: <RedirectWithParams to="/shared-finance/lend-borrow/edit/:id" />,
  },
  {
    path: '/analytics',
    element: (
      <FeatureGate feature={FeatureFlag.ADVANCED_ANALYTICS}>
        <CombinedAnalyticsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/ai',
    element: (
      <FeatureGate feature={FeatureFlag.AI_ASSISTANT}>
        <AIPage />
      </FeatureGate>
    ),
  },
  {
    path: '/import',
    element: (
      <FeatureGate feature={FeatureFlag.ADVANCED_IMPORT}>
        <ImportPage />
      </FeatureGate>
    ),
  },
  {
    path: '/email',
    element: (
      <FeatureGate feature={FeatureFlag.EMAIL_INTEGRATION}>
        <EmailPage />
      </FeatureGate>
    ),
  },
  {
    path: '/email/callback',
    element: (
      <FeatureGate feature={FeatureFlag.EMAIL_INTEGRATION}>
        <EmailCallbackPage />
      </FeatureGate>
    ),
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/activity-log',
    element: <ActivityLogPage />,
  },
  {
    path: '/admin/jobs',
    element: <JobsPage />,
  },
  {
    path: '/categories/:id',
    element: <CategoryDetailPage />,
  },
  {
    path: '/tags/:id',
    element: <TagDetailPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/settings/appearance" replace />,
      },
      {
        path: 'appearance',
        element: <AppearanceTab />,
      },
      {
        path: 'categories',
        element: <CategoriesTab />,
      },
      {
        path: 'tags',
        element: <TagsTab />,
      },
      {
        path: 'reminders',
        element: <RemindersTab />,
      },
      {
        path: 'export',
        element: <ExportTab />,
      },
      {
        path: 'security',
        element: <SecurityTab />,
      },
      {
        path: 'sessions',
        element: <SessionsTab />,
      },
      {
        path: 'privacy',
        element: <PrivacyTab />,
      },
    ],
  },
];

/**
 * Public route configuration
 * These routes are accessible without authentication
 */
export const publicRoutes: RouteObject[] = [
  {
    path: '/goodbye',
    element: <GoodbyePage />,
  },
];
