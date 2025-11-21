import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@services/api';
import { ArrowUpRight, ArrowDownLeft, Calendar, Tag, FolderTree, Search } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface TransactionsTabProps {
  accountId: string;
}

export const TransactionsTab = ({ accountId }: TransactionsTabProps) => {
  const { formatLocale } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch transactions for this account
  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions', { accountId }],
    queryFn: () => transactionsApi.getAll({ accountId }),
    enabled: !!accountId,
  });

  const allTransactions = transactionsResponse?.data || [];

  // Filter transactions based on search
  const transactions = useMemo(() => {
    if (!searchTerm) return allTransactions;

    return allTransactions.filter((txn: any) =>
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.amount?.toString().includes(searchTerm)
    );
  }, [allTransactions, searchTerm]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-500">
          {transactions.length} transaction(s)
        </div>
      </div>

      {/* Transactions List */}
      {!transactions || transactions.length === 0 ? (
        <div className="py-12 text-center">
          <ArrowUpRight className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">No transactions found</p>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Transactions for this account will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction: any) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getTypeIcon(transaction.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {transaction.description || 'Untitled Transaction'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      {transaction.category && (
                        <div className="flex items-center gap-1">
                          <FolderTree className="h-3 w-3" />
                          <span>{transaction.category.name}</span>
                        </div>
                      )}
                      {transaction.tags && transaction.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{transaction.tags.map((t: any) => t.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    {transaction.notes && (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-semibold ${getTypeColor(transaction.type)}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatLocale(Math.abs(Number(transaction.amount)))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
