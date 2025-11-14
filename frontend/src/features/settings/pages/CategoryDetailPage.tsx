import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, transactionsApi } from '@services/api';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { StatusBar } from '@/components/ui/StatusBar';

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatLocale } = useCurrency();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', { categoryId: id }],
    queryFn: () => transactionsApi.getAll({ categoryId: id }),
    enabled: !!id,
  });

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Category not found</p>
        <button
          onClick={() => navigate('/settings?tab=categories')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  const categoryData = category.data;
  const transactionsList = transactions?.data || [];
  const totalAmount = transactionsList.reduce((sum, t) => sum + Number(t.amount), 0);
  const transactionCount = transactionsList.length;

  const statusBarItems = useMemo(() => [
    {
      id: 'count',
      label: 'Transactions',
      value: transactionCount,
      icon: Calendar,
      color: '#3b82f6',
    },
    {
      id: 'total',
      label: 'Total Amount',
      value: formatLocale(totalAmount),
      icon: DollarSign,
      color: categoryData.type === 'income' ? '#10b981' : '#ef4444',
      details: [
        { label: 'Total Amount', value: formatLocale(totalAmount) },
        { label: 'Average per Transaction', value: transactionCount > 0 ? formatLocale(totalAmount / transactionCount) : formatLocale(0) },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      value: categoryData.type === 'income' ? 'Income' : 'Expense',
      icon: categoryData.type === 'income' ? TrendingUp : TrendingDown,
      color: categoryData.type === 'income' ? '#10b981' : '#ef4444',
    },
  ], [transactionCount, totalAmount, categoryData, formatLocale]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/settings?tab=categories')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: categoryData.color || '#3B82F6' }}
          >
            {categoryData.icon && (
              <span className="text-2xl">{categoryData.icon}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{categoryData.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {categoryData.type} Category
            </p>
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
            <p className="text-muted-foreground">No transactions in this category yet</p>
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
