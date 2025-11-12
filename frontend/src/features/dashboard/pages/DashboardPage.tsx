import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi, budgetsApi, investmentsApi, groupsApi, analyticsApi, exportApi } from '@services/api';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { StatCards } from '../components/StatCards';
import { NetWorthBanner } from '../components/NetWorthBanner';
import { BudgetAlerts } from '../components/BudgetAlerts';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { BudgetProgressWidget } from '../components/BudgetProgressWidget';
import { AccountsWidget } from '../components/AccountsWidget';
import { InvestmentsWidget } from '../components/InvestmentsWidget';
import { GroupsWidget } from '../components/GroupsWidget';
import { ExportButton, ExportFormat } from '@/components/export';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['transaction-stats', format(new Date(), 'yyyy-MM')],
    queryFn: () =>
      transactionsApi.getStats(
        format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      ),
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionsApi.getAll({ limit: 5 }),
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: investmentsApi.getPortfolio,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: netWorth } = useQuery({
    queryKey: ['net-worth'],
    queryFn: analyticsApi.getNetWorth,
  });

  const handleExport = async (format: ExportFormat) => {
    try {
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const exportFilters = {
        startDate,
        endDate,
        includeCharts: format === 'pdf',
      };

      let response;
      if (format === 'pdf') {
        response = await exportApi.exportAnalyticsPDF(exportFilters);
      }

      // Download the file
      if (response) {
        const blob = new Blob([response as any], {
          type: 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Dashboard report exported successfully!');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export dashboard report');
    }
  };

  const totalBalance =
    accounts?.data?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0;

  const portfolioStats = portfolio?.data || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalROI: 0,
    totalROIPercentage: 0,
  };

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toFixed(2)}`,
      icon: Wallet,
      color: 'bg-blue-500',
      onClick: () => navigate('/accounts'),
    },
    {
      title: 'Income',
      value: `$${stats?.data?.income?.toFixed(2) || '0.00'}`,
      icon: ArrowUpRight,
      color: 'bg-green-500',
      onClick: () => navigate('/transactions'),
    },
    {
      title: 'Expenses',
      value: `$${stats?.data?.expense?.toFixed(2) || '0.00'}`,
      icon: ArrowDownRight,
      color: 'bg-red-500',
      onClick: () => navigate('/transactions'),
    },
    {
      title: 'Savings',
      value: `$${stats?.data?.savings?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      onClick: () => navigate('/analytics'),
    },
  ];

  // Get budgets that are over 75% spent
  const alertBudgets = budgets?.data?.filter((b: any) => (b.spent / b.amount) * 100 >= 75) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        <ExportButton
          entityType="analytics"
          onExport={handleExport}
          formats={['pdf']}
          variant="button"
          label="Export Report"
        />
      </div>

      {/* Main Stats */}
      <StatCards cards={statCards} />

      {/* Net Worth Banner */}
      <NetWorthBanner data={netWorth?.data} onClick={() => navigate('/analytics')} />

      {/* Budget Alerts */}
      <BudgetAlerts budgets={alertBudgets} onViewBudgets={() => navigate('/budgets')} />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          <RecentTransactionsWidget
            transactions={recentTransactions?.data}
            onViewAll={() => navigate('/transactions')}
          />
          <BudgetProgressWidget
            budgets={budgets?.data}
            onViewAll={() => navigate('/budgets')}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <AccountsWidget
            accounts={accounts?.data}
            onViewAll={() => navigate('/accounts')}
          />
          <InvestmentsWidget
            portfolioStats={portfolioStats}
            onClick={() => navigate('/investments')}
          />
          <GroupsWidget
            groups={groups}
            onClick={() => navigate('/groups')}
          />
        </div>
      </div>
    </div>
  );
}
