import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import Layout from '@components/layout/Layout';
import LoginPage from '@features/auth/pages/LoginPage';
import RegisterPage from '@features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@features/auth/pages/ResetPasswordPage';
import GoogleCallbackPage from '@features/auth/pages/GoogleCallbackPage';
import DashboardPage from '@features/dashboard/pages/DashboardPage';
import TransactionsPage from '@features/transactions/pages/TransactionsPage';
import DuplicatesPage from '@features/transactions/pages/DuplicatesPage';
import AccountsPage from '@features/accounts/pages/AccountsPage';
import BudgetsPage from '@features/budgets/pages/BudgetsPage';
import GroupsPage from '@features/groups/pages/GroupsPage';
import InvestmentsPage from '@features/investments/pages/InvestmentsPage';
import LendBorrowPage from '@features/lend-borrow/pages/LendBorrowPage';
import AnalyticsPage from '@features/analytics/pages/AnalyticsPage';
import AIPage from '@features/ai/pages/AIPage';
import ImportPage from '@features/import/pages/ImportPage';
import EmailPage from '@features/email/pages/EmailPage';
import NotificationsPage from '@features/notifications/pages/NotificationsPage';
import SettingsPage from '@features/settings/pages/SettingsPage';
import ActivityLogPage from '@features/audit/pages/ActivityLogPage';
import GoodbyePage from '@pages/GoodbyePage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />} />
      <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />
      <Route path="/goodbye" element={<GoodbyePage />} />

      {/* Protected routes */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/new" element={<TransactionsPage />} />
        <Route path="/transactions/edit/:id" element={<TransactionsPage />} />
        <Route path="/transactions/duplicates" element={<DuplicatesPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/new" element={<AccountsPage />} />
        <Route path="/accounts/edit/:id" element={<AccountsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/budgets/new" element={<BudgetsPage />} />
        <Route path="/budgets/edit/:id" element={<BudgetsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/new" element={<GroupsPage />} />
        <Route path="/groups/edit/:id" element={<GroupsPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/investments/new" element={<InvestmentsPage />} />
        <Route path="/investments/edit/:id" element={<InvestmentsPage />} />
        <Route path="/lend-borrow" element={<LendBorrowPage />} />
        <Route path="/lend-borrow/new" element={<LendBorrowPage />} />
        <Route path="/lend-borrow/edit/:id" element={<LendBorrowPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/email" element={<EmailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/activity-log" element={<ActivityLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
