import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import Layout from '@components/layout/Layout';
import LoginPage from '@features/auth/pages/LoginPage';
import RegisterPage from '@features/auth/pages/RegisterPage';
import DashboardPage from '@features/dashboard/pages/DashboardPage';
import TransactionsPage from '@features/transactions/pages/TransactionsPage';
import AccountsPage from '@features/accounts/pages/AccountsPage';
import BudgetsPage from '@features/budgets/pages/BudgetsPage';
import GroupsPage from '@features/groups/pages/GroupsPage';
import InvestmentsPage from '@features/investments/pages/InvestmentsPage';
import AnalyticsPage from '@features/analytics/pages/AnalyticsPage';
import SettingsPage from '@features/settings/pages/SettingsPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

      {/* Protected routes */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
