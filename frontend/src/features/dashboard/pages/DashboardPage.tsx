import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi } from '@services/api';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function DashboardPage() {
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

  const totalBalance =
    accounts?.data?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0;

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toFixed(2)}`,
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'Income',
      value: `$${stats?.data?.income?.toFixed(2) || '0.00'}`,
      icon: ArrowUpRight,
      color: 'bg-green-500',
    },
    {
      title: 'Expenses',
      value: `$${stats?.data?.expense?.toFixed(2) || '0.00'}`,
      icon: ArrowDownRight,
      color: 'bg-red-500',
    },
    {
      title: 'Savings',
      value: `$${stats?.data?.savings?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="rounded-lg bg-white p-6 shadow">
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <div className="mt-4 space-y-3">
            {recentTransactions?.data?.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
          <div className="mt-4 space-y-3">
            {accounts?.data?.map((account: any) => (
              <div key={account.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.type}</p>
                </div>
                <p className="font-semibold text-gray-900">${Number(account.balance).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
