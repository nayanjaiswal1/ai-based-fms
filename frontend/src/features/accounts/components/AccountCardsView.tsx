import { useState } from 'react';
import { Edit, Trash2, Upload, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
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
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { formatLocale } = useCurrency();

  const handleCardClick = (accountId: string) => {
    setSelectedAccountId(selectedAccountId === accountId ? null : accountId);
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  const { data: transactions } = useQuery({
    queryKey: ['transactions', { accountId: selectedAccountId }],
    queryFn: () => transactionsApi.getAll({ accountId: selectedAccountId, limit: 10 }),
    enabled: !!selectedAccountId,
  });

  const transactionsList = transactions?.data || [];

  const getCardGradient = (type: string, index: number) => {
    const gradients = [
      'from-blue-500/90 via-blue-600/90 to-indigo-700/90',
      'from-purple-500/90 via-purple-600/90 to-pink-600/90',
      'from-emerald-500/90 via-teal-600/90 to-cyan-700/90',
      'from-orange-500/90 via-red-600/90 to-pink-700/90',
      'from-indigo-500/90 via-purple-600/90 to-blue-700/90',
      'from-rose-500/90 via-pink-600/90 to-fuchsia-700/90',
      'from-teal-500/90 via-emerald-600/90 to-green-700/90',
      'from-amber-500/90 via-orange-600/90 to-red-700/90',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Stacked Cards Container */}
        <div className="relative flex items-center justify-center min-h-[500px] mb-8">
          {accounts.map((account, index) => {
            const Icon = getAccountIcon(account.type);
            const gradient = getCardGradient(account.type, index);
            const isSelected = selectedAccountId === account.id;
            const totalCards = accounts.length;

            // Calculate stacking position
            let transform = '';
            let zIndex = totalCards - index;

            if (isSelected) {
              // Selected card: center and larger
              transform = 'translateX(0%) translateY(0%) scale(1.05)';
              zIndex = 100;
            } else if (selectedAccountId) {
              // When another card is selected, stack others to the side
              const selectedIndex = accounts.findIndex(a => a.id === selectedAccountId);
              if (index < selectedIndex) {
                transform = `translateX(-${(selectedIndex - index) * 120}%) translateY(${(selectedIndex - index) * 10}px) scale(0.85) rotate(-3deg)`;
              } else {
                transform = `translateX(${(index - selectedIndex) * 120}%) translateY(${(index - selectedIndex) * 10}px) scale(0.85) rotate(3deg)`;
              }
              zIndex = index < selectedIndex ? index : totalCards - index;
            } else {
              // Default stacked position
              const offset = (index - Math.floor(totalCards / 2)) * 40;
              transform = `translateX(${offset}px) translateY(${index * 15}px) rotate(${(index - Math.floor(totalCards / 2)) * 2}deg)`;
            }

            return (
              <div
                key={account.id}
                className={`absolute w-96 cursor-pointer transition-all duration-500 ease-out ${
                  isSelected ? 'cursor-default' : 'hover:scale-105'
                }`}
                style={{
                  transform,
                  zIndex,
                }}
                onClick={() => !isSelected && handleCardClick(account.id)}
              >
                {/* Glass Card */}
                <div
                  className={`relative rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20 ${
                    isSelected ? 'ring-4 ring-white/50' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                  }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />

                  {/* Glass Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

                  {/* Decorative Blur Circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

                  {/* Card Content */}
                  <div className="relative p-8 text-white">
                    {/* Top Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
                            {account.type}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(account);
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(account.id, account.name);
                            }}
                            className="p-2 bg-white/20 hover:bg-red-500/30 backdrop-blur-sm rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAccountId(null);
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Account Name */}
                    <h3 className="text-2xl font-bold mb-4 drop-shadow-lg">
                      {account.name}
                    </h3>

                    {/* Balance */}
                    <div className="mb-4">
                      <p className="text-sm opacity-80 mb-1">Current Balance</p>
                      <p className="text-4xl font-bold drop-shadow-lg">
                        {formatLocale(account.balance)}
                      </p>
                    </div>

                    {/* Card Number */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono tracking-wider opacity-80">
                        •••• •••• •••• {account.id.slice(-4)}
                      </p>
                      {account.currency && account.currency !== 'USD' && (
                        <p className="text-sm font-bold opacity-90">{account.currency}</p>
                      )}
                    </div>

                    {/* Tap to expand hint */}
                    {!isSelected && (
                      <div className="mt-4 text-center">
                        <p className="text-xs opacity-60 flex items-center justify-center gap-1">
                          <ChevronDown className="h-3 w-3" />
                          Tap to view details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transaction Details Panel (appears when card is selected) */}
        {selectedAccount && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Glass Panel */}
            <div className="rounded-3xl overflow-hidden backdrop-blur-xl bg-white/60 border border-white/20 shadow-2xl">
              {/* Tabs */}
              <div className="flex border-b border-white/20 bg-gradient-to-r from-white/40 to-white/20">
                <button className="flex-1 px-6 py-4 text-sm font-semibold text-slate-700 bg-white/50 border-b-2 border-blue-500">
                  Transactions
                </button>
                <button
                  onClick={() => onReconcile(selectedAccount)}
                  className="flex-1 px-6 py-4 text-sm font-semibold text-slate-600 hover:bg-white/30 transition-colors"
                >
                  Upload Statement
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {transactionsList.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 font-medium">No transactions yet</p>
                    <button
                      onClick={() => navigate(`/transactions?accountId=${selectedAccount.id}`)}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
                    >
                      Add Transaction
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionsList.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        onClick={() => navigate(`/transactions?id=${transaction.id}`)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer border border-white/20"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-xl ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(transaction.date).toLocaleDateString()}
                              {transaction.category && (
                                <span>• {transaction.category.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className={`text-lg font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatLocale(transaction.amount)}
                        </p>
                      </div>
                    ))}

                    <button
                      onClick={() => navigate(`/transactions?accountId=${selectedAccount.id}`)}
                      className="w-full py-3 text-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      View All Transactions →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
