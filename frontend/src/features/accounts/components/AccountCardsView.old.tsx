import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, List, FileText, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountCardsViewProps {
  accounts: any[];
  onEdit: (account: any) => void;
  onDelete: (id: string, name: string) => void;
  onReconcile: (account: any) => void;
  getAccountIcon: (type: string) => any;
}

type TabType = 'transactions' | 'statement' | 'history';

export function AccountCardsView({
  accounts,
  onEdit,
  onDelete,
  onReconcile,
  getAccountIcon
}: AccountCardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const navigate = useNavigate();

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : accounts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < accounts.length - 1 ? prev + 1 : 0));
  };

  const getCardGradient = (type: string, index: number) => {
    const gradients = [
      'from-slate-700 to-slate-800',
      'from-blue-700 to-indigo-800',
      'from-purple-700 to-purple-800',
      'from-teal-700 to-cyan-800',
      'from-emerald-700 to-green-800',
      'from-orange-700 to-amber-800',
      'from-rose-700 to-pink-800',
      'from-indigo-700 to-blue-800',
    ];
    return gradients[index % gradients.length];
  };

  const currentAccount = accounts[currentIndex];
  const Icon = getAccountIcon(currentAccount?.type);
  const gradient = getCardGradient(currentAccount?.type, currentIndex);

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-xl p-4 md:p-8">
      <div className="flex flex-col items-center justify-center">

        {/* Main Card Display */}
        <div className="relative w-full max-w-5xl">

          {/* Large Featured Card */}
          <div className="relative mb-8">
            <div className={`w-full h-[280px] md:h-[340px] rounded-2xl shadow-2xl p-8 md:p-10 bg-gradient-to-br ${gradient} text-white relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300`}>

              {/* Background Decorative Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">

                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-8 w-8 opacity-90" />
                      <span className="text-sm font-medium opacity-90 uppercase tracking-wider">{currentAccount?.type}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{currentAccount?.name}</h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(currentAccount)}
                      className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all hover:scale-110"
                      aria-label="Edit account"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(currentAccount.id, currentAccount.name)}
                      className="p-2.5 bg-white/20 hover:bg-red-500/30 rounded-lg backdrop-blur-sm transition-all hover:scale-110"
                      aria-label="Delete account"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Middle - Balance */}
                <div className="my-6">
                  <p className="text-sm md:text-base opacity-80 mb-2">Current Balance</p>
                  <p className="text-5xl md:text-6xl font-bold tracking-tight">
                    ${Number(currentAccount?.balance).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm opacity-70 mb-1">Account Number</p>
                    <p className="text-lg font-mono tracking-wider">•••• •••• •••• {currentAccount?.id.slice(-4)}</p>
                  </div>
                  {currentAccount?.currency && currentAccount.currency !== 'USD' && (
                    <div className="text-right">
                      <p className="text-sm opacity-70 mb-1">Currency</p>
                      <p className="text-xl font-bold">{currentAccount.currency}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-30 p-3 md:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 border border-gray-200"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-6 w-6 md:h-7 md:w-7 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-30 p-3 md:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 border border-gray-200"
              aria-label="Next card"
            >
              <ChevronRight className="h-6 w-6 md:h-7 md:w-7 text-gray-700" />
            </button>
          </div>

          {/* Pagination Indicators */}
          <div className="flex justify-center gap-3 mb-8">
            {accounts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-12 bg-gradient-to-r from-blue-600 to-indigo-600'
                    : 'w-2 bg-gray-400 hover:bg-gray-500'
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>

          {/* Detail Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'transactions'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5 inline-block mr-2" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('statement')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'statement'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-5 w-5 inline-block mr-2" />
                Statement
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-5 w-5 inline-block mr-2" />
                History
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'transactions' && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
                    <List className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Transactions</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    View all transactions for <span className="font-semibold">{currentAccount?.name}</span>
                  </p>
                  {currentAccount?.description && (
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      {currentAccount.description}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/transactions?accountId=${currentAccount?.id}`)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    View All Transactions
                  </button>
                </div>
              )}

              {activeTab === 'statement' && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4">
                    <FileText className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Account Statement</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Generate or download statement for <span className="font-semibold">{currentAccount?.name}</span>
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => onReconcile(currentAccount)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      Reconcile Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-4">
                    <TrendingUp className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Balance History</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Track balance changes for <span className="font-semibold">{currentAccount?.name}</span>
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Balance:</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${Number(currentAccount?.balance).toFixed(2)}
                        </span>
                      </div>
                      {currentAccount?.lastReconciledAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Last Reconciled:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(currentAccount.lastReconciledAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Account Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {currentAccount?.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add New Account Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/accounts/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
            >
              <Plus className="h-5 w-5" />
              Add New Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
