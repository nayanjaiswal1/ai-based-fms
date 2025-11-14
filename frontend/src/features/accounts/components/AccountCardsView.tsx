import { useState } from 'react';
import { Edit, Trash2, Upload, ChevronDown, ChevronUp, Check, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@services/api';
import { useCurrency } from '@/hooks/useCurrency';

interface AccountCardsViewProps {
  accounts: any[];
  onEdit: (account: any) => void;
  onDelete: (id: string, name: string) => void;
  onReconcile: (account: any) => void;
  getAccountIcon: (type: string) => any;
}

export function AccountCardsView({
  accounts,
  onEdit,
  onDelete,
  onReconcile,
  getAccountIcon
}: AccountCardsViewProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const navigate = useNavigate();
  const { formatLocale } = useCurrency();

  const toggleSelect = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
      if (expandedAccount === accountId) {
        setExpandedAccount(null);
      }
    } else {
      newSelected.add(accountId);
      setExpandedAccount(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const toggleExpand = (accountId: string) => {
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
    } else {
      setExpandedAccount(accountId);
      if (!selectedAccounts.has(accountId)) {
        const newSelected = new Set(selectedAccounts);
        newSelected.add(accountId);
        setSelectedAccounts(newSelected);
      }
    }
  };

  const getCardGradient = (type: string, index: number) => {
    const gradients = [
      'from-slate-600 to-slate-700',
      'from-blue-600 to-indigo-700',
      'from-purple-600 to-purple-700',
      'from-teal-600 to-cyan-700',
      'from-emerald-600 to-green-700',
      'from-orange-600 to-amber-700',
      'from-rose-600 to-pink-700',
      'from-indigo-600 to-blue-700',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedAccounts.size > 0 ? `${selectedAccounts.size} selected` : 'Select accounts to view details'}
          </p>
        </div>
        {selectedAccounts.size > 0 && (
          <button
            onClick={() => {
              setSelectedAccounts(new Set());
              setExpandedAccount(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account, index) => {
          const Icon = getAccountIcon(account.type);
          const gradient = getCardGradient(account.type, index);
          const isSelected = selectedAccounts.has(account.id);
          const isExpanded = expandedAccount === account.id;

          return (
            <AccountCard
              key={account.id}
              account={account}
              Icon={Icon}
              gradient={gradient}
              isSelected={isSelected}
              isExpanded={isExpanded}
              onToggleSelect={toggleSelect}
              onToggleExpand={toggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onReconcile={onReconcile}
              formatLocale={formatLocale}
              navigate={navigate}
            />
          );
        })}
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: any;
  Icon: any;
  gradient: string;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEdit: (account: any) => void;
  onDelete: (id: string, name: string) => void;
  onReconcile: (account: any) => void;
  formatLocale: (amount: number) => string;
  navigate: any;
}

function AccountCard({
  account,
  Icon,
  gradient,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  onReconcile,
  formatLocale,
  navigate,
}: AccountCardProps) {
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', { accountId: account.id }],
    queryFn: () => transactionsApi.getAll({ accountId: account.id, limit: 5 }),
    enabled: isExpanded,
  });

  const transactionsList = transactions?.data || [];

  return (
    <div
      className={`relative transition-all duration-300 ${
        isSelected ? 'transform scale-105 z-10' : 'z-0'
      }`}
    >
      {/* Main Card */}
      <div
        className={`relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
          isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''
        }`}
      >
        {/* Card Header */}
        <div
          className={`relative bg-gradient-to-br ${gradient} text-white p-4 cursor-pointer`}
          onClick={() => onToggleSelect(account.id)}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-3 right-3 z-20">
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-white border-white'
                  : 'bg-transparent border-white/60 hover:border-white'
              }`}
            >
              {isSelected && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Card Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-6 w-6" />
              <span className="text-xs uppercase tracking-wider opacity-90">{account.type}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 truncate">{account.name}</h3>
            <p className="text-2xl font-bold tracking-tight">{formatLocale(account.balance)}</p>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="relative z-20 flex gap-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(account);
              }}
              className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all text-sm font-medium"
            >
              <Edit className="h-4 w-4 inline mr-1" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(account.id, account.name);
              }}
              className="px-3 py-2 bg-white/20 hover:bg-red-500/30 rounded-lg backdrop-blur-sm transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expandable Section */}
        {isSelected && (
          <div className="bg-white">
            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(account.id);
              }}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
            >
              <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/transactions?accountId=${account.id}`)}
                    className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 inline mr-1" />
                    All Transactions
                  </button>
                  <button
                    onClick={() => onReconcile(account)}
                    className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 inline mr-1" />
                    Upload Statement
                  </button>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Transactions</h4>
                  {transactionsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : transactionsList.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-3">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {transactionsList.slice(0, 5).map((transaction: any) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/transactions?id=${transaction.id}`)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p
                            className={`text-xs font-semibold flex-shrink-0 ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatLocale(transaction.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Info */}
                {account.description && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">{account.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlapping Card Effect for Selected */}
      {isSelected && (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl -z-10 transform translate-x-1 translate-y-1 opacity-40`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl -z-20 transform translate-x-2 translate-y-2 opacity-20`}
          />
        </>
      )}
    </div>
  );
}
