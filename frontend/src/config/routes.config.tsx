import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { FeatureGate } from '@/components/feature-gate';
import { FeatureFlag } from './features.config';

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
const GroupsPage = lazy(() => import('@features/groups/pages/GroupsPage'));
const InvestmentsPage = lazy(() => import('@features/investments/pages/InvestmentsPage'));
const LendBorrowPage = lazy(() => import('@features/lend-borrow/pages/LendBorrowPage'));
const AnalyticsPage = lazy(() => import('@features/analytics/pages/AnalyticsPage'));
const InsightsDashboardPage = lazy(() => import('@features/insights/pages/InsightsDashboardPage'));
const ReportsPage = lazy(() => import('@features/reports/pages/ReportsPage'));
const AIPage = lazy(() => import('@features/ai/pages/AIPage'));
const ImportPage = lazy(() => import('@features/import/pages/ImportPage'));
const EmailPage = lazy(() => import('@features/email/pages/EmailPage'));
const NotificationsPage = lazy(() => import('@features/notifications/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@features/settings/pages/SettingsPage'));
const ActivityLogPage = lazy(() => import('@features/audit/pages/ActivityLogPage'));
const JobsPage = lazy(() => import('@features/admin/pages/JobsPage'));
const GoodbyePage = lazy(() => import('../pages/GoodbyePage'));

// Settings tab components
const AppearanceTab = lazy(() => import('@features/settings/components/AppearanceTab'));
const CategoriesTab = lazy(() => import('@features/settings/components/CategoriesTab'));
const TagsTab = lazy(() => import('@features/settings/components/TagsTab'));
const RemindersTab = lazy(() => import('@features/settings/components/RemindersTab'));
const OAuthTab = lazy(() => import('@features/settings/components/OAuthTab'));
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
    element: <BudgetsPage />,
  },
  {
    path: '/budgets/edit/:id',
    element: <BudgetsPage />,
  },
  {
    path: '/groups',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <GroupsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/groups/new',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <GroupsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/groups/edit/:id',
    element: (
      <FeatureGate feature={FeatureFlag.GROUPS}>
        <GroupsPage />
      </FeatureGate>
    ),
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
  {
    path: '/lend-borrow',
    element: (
      <FeatureGate feature={FeatureFlag.LEND_BORROW}>
        <LendBorrowPage />
      </FeatureGate>
    ),
  },
  {
    path: '/lend-borrow/new',
    element: (
      <FeatureGate feature={FeatureFlag.LEND_BORROW}>
        <LendBorrowPage />
      </FeatureGate>
    ),
  },
  {
    path: '/lend-borrow/edit/:id',
    element: (
      <FeatureGate feature={FeatureFlag.LEND_BORROW}>
        <LendBorrowPage />
      </FeatureGate>
    ),
  },
  {
    path: '/analytics',
    element: (
      <FeatureGate feature={FeatureFlag.ADVANCED_ANALYTICS}>
        <AnalyticsPage />
      </FeatureGate>
    ),
  },
  {
    path: '/insights',
    element: (
      <FeatureGate feature={FeatureFlag.INSIGHTS}>
        <InsightsDashboardPage />
      </FeatureGate>
    ),
  },
  {
    path: '/reports',
    element: (
      <FeatureGate feature={FeatureFlag.BASIC_REPORTS}>
        <ReportsPage />
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
        path: 'oauth',
        element: <OAuthTab />,
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
