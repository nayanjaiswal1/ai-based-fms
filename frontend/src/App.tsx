import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import Layout from '@components/layout/Layout';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Eager load critical auth pages (no code splitting for auth flow)
import LoginPage from '@features/auth/pages/LoginPage';
import RegisterPage from '@features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@features/auth/pages/ResetPasswordPage';
import GoogleCallbackPage from '@features/auth/pages/GoogleCallbackPage';

// Lazy load dashboard (critical route - preload on auth)
const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));

// Lazy load transaction pages
const TransactionsPage = lazy(() => import('@features/transactions/pages/TransactionsPage'));
const DuplicatesPage = lazy(() => import('@features/transactions/pages/DuplicatesPage'));

// Lazy load account pages
const AccountsPage = lazy(() => import('@features/accounts/pages/AccountsPage'));
const ReconciliationPage = lazy(() => import('@features/reconciliation/pages/ReconciliationPage'));

// Lazy load budget pages
const BudgetsPage = lazy(() => import('@features/budgets/pages/BudgetsPage'));

// Lazy load groups pages
const GroupsPage = lazy(() => import('@features/groups/pages/GroupsPage'));

// Lazy load investment pages
const InvestmentsPage = lazy(() => import('@features/investments/pages/InvestmentsPage'));

// Lazy load lend-borrow pages
const LendBorrowPage = lazy(() => import('@features/lend-borrow/pages/LendBorrowPage'));

// Lazy load analytics pages (heavy charts)
const AnalyticsPage = lazy(() => import('@features/analytics/pages/AnalyticsPage'));
const InsightsDashboardPage = lazy(() => import('@features/insights/pages/InsightsDashboardPage'));

// Lazy load reports page
const ReportsPage = lazy(() => import('@features/reports/pages/ReportsPage'));

// Lazy load AI page
const AIPage = lazy(() => import('@features/ai/pages/AIPage'));

// Lazy load import/export pages
const ImportPage = lazy(() => import('@features/import/pages/ImportPage'));

// Lazy load email page
const EmailPage = lazy(() => import('@features/email/pages/EmailPage'));

// Lazy load notifications page
const NotificationsPage = lazy(() => import('@features/notifications/pages/NotificationsPage'));

// Lazy load settings page
const SettingsPage = lazy(() => import('@features/settings/pages/SettingsPage'));

// Lazy load activity log page
const ActivityLogPage = lazy(() => import('@features/audit/pages/ActivityLogPage'));

// Lazy load admin pages
const JobsPage = lazy(() => import('@features/admin/pages/JobsPage'));

// Lazy load goodbye page
const GoodbyePage = lazy(() => import('@pages/GoodbyePage'));

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes - No lazy loading for auth flows */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />} />
      <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />
      <Route
        path="/goodbye"
        element={
          <Suspense fallback={<PageLoader />}>
            <GoodbyePage />
          </Suspense>
        }
      />

      {/* Protected routes - All lazy loaded with suspense */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/transactions"
          element={
            <Suspense fallback={<PageLoader />}>
              <TransactionsPage />
            </Suspense>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <TransactionsPage />
            </Suspense>
          }
        />
        <Route
          path="/transactions/edit/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <TransactionsPage />
            </Suspense>
          }
        />
        <Route
          path="/transactions/duplicates"
          element={
            <Suspense fallback={<PageLoader />}>
              <DuplicatesPage />
            </Suspense>
          }
        />
        <Route
          path="/accounts"
          element={
            <Suspense fallback={<PageLoader />}>
              <AccountsPage />
            </Suspense>
          }
        />
        <Route
          path="/accounts/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <AccountsPage />
            </Suspense>
          }
        />
        <Route
          path="/accounts/edit/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <AccountsPage />
            </Suspense>
          }
        />
        <Route
          path="/reconciliation"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReconciliationPage />
            </Suspense>
          }
        />
        <Route
          path="/reconciliation/:reconciliationId"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReconciliationPage />
            </Suspense>
          }
        />
        <Route
          path="/budgets"
          element={
            <Suspense fallback={<PageLoader />}>
              <BudgetsPage />
            </Suspense>
          }
        />
        <Route
          path="/budgets/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <BudgetsPage />
            </Suspense>
          }
        />
        <Route
          path="/budgets/edit/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <BudgetsPage />
            </Suspense>
          }
        />
        <Route
          path="/groups"
          element={
            <Suspense fallback={<PageLoader />}>
              <GroupsPage />
            </Suspense>
          }
        />
        <Route
          path="/groups/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <GroupsPage />
            </Suspense>
          }
        />
        <Route
          path="/groups/edit/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <GroupsPage />
            </Suspense>
          }
        />
        <Route
          path="/investments"
          element={
            <Suspense fallback={<PageLoader />}>
              <InvestmentsPage />
            </Suspense>
          }
        />
        <Route
          path="/investments/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <InvestmentsPage />
            </Suspense>
          }
        />
        <Route
          path="/investments/edit/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <InvestmentsPage />
            </Suspense>
          }
        />
        <Route
          path="/lend-borrow"
          element={
            <Suspense fallback={<PageLoader />}>
              <LendBorrowPage />
            </Suspense>
          }
        />
        <Route
          path="/lend-borrow/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <LendBorrowPage />
            </Suspense>
          }
        />
        <Route
          path="/lend-borrow/edit/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <LendBorrowPage />
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="/insights"
          element={
            <Suspense fallback={<PageLoader />}>
              <InsightsDashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          }
        />
        <Route
          path="/ai"
          element={
            <Suspense fallback={<PageLoader />}>
              <AIPage />
            </Suspense>
          }
        />
        <Route
          path="/import"
          element={
            <Suspense fallback={<PageLoader />}>
              <ImportPage />
            </Suspense>
          }
        />
        <Route
          path="/email"
          element={
            <Suspense fallback={<PageLoader />}>
              <EmailPage />
            </Suspense>
          }
        />
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
          }
        />
        <Route
          path="/activity-log"
          element={
            <Suspense fallback={<PageLoader />}>
              <ActivityLogPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <Suspense fallback={<PageLoader />}>
              <JobsPage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
