import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tagsApi, transactionsApi } from '@services/api';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { StatusBar } from '@/components/ui/StatusBar';
import { DollarSign } from 'lucide-react';

export default function TagDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatLocale } = useCurrency();

  const { data: tag, isLoading: tagLoading } = useQuery({
    queryKey: ['tag', id],
    queryFn: () => tagsApi.getOne(id!),
    enabled: !!id,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', { tagId: id }],
    queryFn: () => transactionsApi.getAll({ tagId: id }),
    enabled: !!id,
  });

  if (tagLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tag details...</p>
        </div>
      </div>
    );
  }

  if (!tag?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tag not found</p>
        <button
          onClick={() => navigate('/settings?tab=tags')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Tags
        </button>
      </div>
    );
  }

  const tagData = tag.data;
  const transactionsList = transactions?.data || [];
  const transactionCount = transactionsList.length;
  const totalIncome = transactionsList
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactionsList

  const statusBarItems = useMemo(() => [
    {
      id: 'count',
      label: 'Transactions',
      value: transactionCount,
      icon: Calendar,
      color: '#3b82f6',
    },
    {
      id: 'income',
      label: 'Income',
      value: formatLocale(totalIncome),
      icon: TrendingUp,
      color: '#10b981',
      details: [
        { label: 'Total Income', value: formatLocale(totalIncome) },
        { label: 'Income Count', value: transactionsList.filter(t => t.type === 'income').length },
      ],
    },
    {
      id: 'expense',
      label: 'Expense',
      value: formatLocale(totalExpense),
      icon: TrendingDown,
      color: '#ef4444',
      details: [
        { label: 'Total Expense', value: formatLocale(totalExpense) },
        { label: 'Expense Count', value: transactionsList.filter(t => t.type === 'expense').length },
      ],
    },
    {
      id: 'net',
      label: 'Net',
      value: formatLocale(Math.abs(totalIncome - totalExpense)),
      icon: (totalIncome - totalExpense) >= 0 ? TrendingUp : TrendingDown,
      color: (totalIncome - totalExpense) >= 0 ? '#10b981' : '#ef4444',
    },
  ], [transactionCount, totalIncome, totalExpense, transactionsList, formatLocale]);
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/settings?tab=tags')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: tagData.color || '#3B82F6' }}
          >
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tagData.name}</h1>
            <p className="text-sm text-muted-foreground">Tag</p>
          </div>
        </div>
      </div>


      {/* Transactions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Transactions</h2>

        {transactionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        ) : transactionsList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
            <p className="text-muted-foreground">No transactions with this tag yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactionsList.map((transaction: any) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/transactions?id=${transaction.id}`)}
                className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{transaction.description}</h4>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          {transaction.category && (
                            <span>• {transaction.category.name}</span>
                          )}
                          {transaction.account && (
                            <span>• {transaction.account.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatLocale(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Excel-style Status Bar */}
      {transactionsList.length > 0 && <StatusBar items={statusBarItems} />}
    </div>
  );
}
