import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { ErrorBoundary } from '@/components/error-boundary';
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

// Helper component to wrap pages with ErrorBoundary and Suspense
const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary level="page">
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
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
          <ProtectedPage>
            <GoodbyePage />
          </ProtectedPage>
        }
      />

      {/* Protected routes - All lazy loaded with suspense */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route
          path="/"
          element={
            <ProtectedPage>
              <DashboardPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedPage>
              <TransactionsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <ProtectedPage>
              <TransactionsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/transactions/edit/:id"
          element={
            <ProtectedPage>
              <TransactionsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/transactions/duplicates"
          element={
            <ProtectedPage>
              <DuplicatesPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedPage>
              <AccountsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/accounts/new"
          element={
            <ProtectedPage>
              <AccountsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/accounts/edit/:id"
          element={
            <ProtectedPage>
              <AccountsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/reconciliation"
          element={
            <ProtectedPage>
              <ReconciliationPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/reconciliation/:reconciliationId"
          element={
            <ProtectedPage>
              <ReconciliationPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedPage>
              <BudgetsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/budgets/new"
          element={
            <ProtectedPage>
              <BudgetsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/budgets/edit/:id"
          element={
            <ProtectedPage>
              <BudgetsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedPage>
              <GroupsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/groups/new"
          element={
            <ProtectedPage>
              <GroupsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/groups/edit/:id"
          element={
            <ProtectedPage>
              <GroupsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/investments"
          element={
            <ProtectedPage>
              <InvestmentsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/investments/new"
          element={
            <ProtectedPage>
              <InvestmentsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/investments/edit/:id"
          element={
            <ProtectedPage>
              <InvestmentsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/lend-borrow"
          element={
            <ProtectedPage>
              <LendBorrowPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/lend-borrow/new"
          element={
            <ProtectedPage>
              <LendBorrowPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/lend-borrow/edit/:id"
          element={
            <ProtectedPage>
              <LendBorrowPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedPage>
              <AnalyticsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedPage>
              <InsightsDashboardPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedPage>
              <ReportsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedPage>
              <AIPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedPage>
              <ImportPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/email"
          element={
            <ProtectedPage>
              <EmailPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedPage>
              <NotificationsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/activity-log"
          element={
            <ProtectedPage>
              <ActivityLogPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedPage>
              <JobsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedPage>
              <SettingsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/settings/:tab"
          element={
            <ProtectedPage>
              <SettingsPage />
            </ProtectedPage>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
