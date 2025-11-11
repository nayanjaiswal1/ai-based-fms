import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi, budgetsApi, investmentsApi, groupsApi, analyticsApi } from '@services/api';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, AlertTriangle, Users, DollarSign, Target, ArrowRight } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            onClick={stat.onClick}
            className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Net Worth Banner */}
      {netWorth?.data && (
        <div
          onClick={() => navigate('/analytics')}
          className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg transition-shadow hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Net Worth</p>
              <p className="mt-2 text-4xl font-bold">${netWorth.data.netWorth.toFixed(2)}</p>
            </div>
            <ArrowRight className="h-6 w-6 opacity-75" />
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {alertBudgets.length > 0 && (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Budget Alerts</p>
              <p className="text-sm text-yellow-700">
                {alertBudgets.length} budget(s) approaching or exceeding limits
              </p>
            </div>
            <button
              onClick={() => navigate('/budgets')}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              View Budgets
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Transactions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => navigate('/transactions')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {recentTransactions?.data?.length === 0 ? (
                <p className="text-center text-gray-500">No transactions yet</p>
              ) : (
                recentTransactions?.data?.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Budgets Overview */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Budget Progress</h2>
              <button
                onClick={() => navigate('/budgets')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {budgets?.data?.length === 0 ? (
                <p className="text-center text-gray-500">No budgets created</p>
              ) : (
                budgets?.data?.slice(0, 3).map((budget: any) => {
                  const percentage = (budget.spent / budget.amount) * 100;
                  const getColor = (pct: number) => {
                    if (pct >= 90) return 'bg-red-500';
                    if (pct >= 75) return 'bg-yellow-500';
                    return 'bg-green-500';
                  };

                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{budget.name}</span>
                        <span className="text-gray-600">
                          ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${getColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Accounts */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
              <button
                onClick={() => navigate('/accounts')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {accounts?.data?.length === 0 ? (
                <p className="text-center text-gray-500">No accounts</p>
              ) : (
                accounts?.data?.slice(0, 4).map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm capitalize text-gray-500">{account.type}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${Number(account.balance).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Investment Summary */}
          <div
            onClick={() => navigate('/investments')}
            className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Investments</h2>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Portfolio Value</span>
                <span className="font-semibold text-gray-900">
                  ${portfolioStats.totalCurrentValue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Return</span>
                <span
                  className={`font-semibold ${
                    portfolioStats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {portfolioStats.totalROI >= 0 ? '+' : ''}${portfolioStats.totalROI.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ROI</span>
                <span
                  className={`font-semibold ${
                    portfolioStats.totalROIPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {portfolioStats.totalROIPercentage >= 0 ? '+' : ''}
                  {portfolioStats.totalROIPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Groups Summary */}
          {groups?.data && groups.data.length > 0 && (
            <div
              onClick={() => navigate('/groups')}
              className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{groups.data.length} Groups</p>
                    <p className="text-sm text-gray-500">Active expense sharing</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
