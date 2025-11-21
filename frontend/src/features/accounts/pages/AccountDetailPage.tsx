import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@services/api';
import { ArrowLeft, Wallet, CreditCard, DollarSign, Banknote } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs';
import { StatementsTab } from '../components/StatementsTab';
import { TransactionsTab } from '../components/TransactionsTab';
import { BalanceReconciliationTab } from '../components/BalanceReconciliationTab';
import { useCurrency } from '@/hooks/useCurrency';

type TabValue = 'statements' | 'transactions' | 'balance';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { symbol, formatLocale } = useCurrency();
  const [activeTab, setActiveTab] = useState<TabValue>('transactions');

  // Fetch account details
  const { data: accountResponse, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getOne(id!),
    enabled: !!id,
  });

  const account = accountResponse?.data;

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return Banknote;
      case 'card':
        return CreditCard;
      case 'wallet':
        return Wallet;
      case 'cash':
        return DollarSign;
      default:
        return Wallet;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-500';
      case 'card':
        return 'bg-purple-500';
      case 'wallet':
        return 'bg-green-500';
      case 'cash':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">Loading account details...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-red-500">Account not found</p>
        <button
          onClick={() => navigate('/accounts')}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Accounts
        </button>
      </div>
    );
  }

  const Icon = getAccountIcon(account.type);
  const colorClass = getAccountTypeColor(account.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={() => navigate('/accounts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Accounts</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-4 ${colorClass}`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
              <p className="text-sm text-gray-500 capitalize mt-1">{account.type} Account</p>
              {account.accountNumber && (
                <p className="text-xs text-gray-400 mt-1">
                  {account.accountNumber}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatLocale(Number(account.balance))}
            </p>
          </div>
        </div>

        {account.description && (
          <p className="mt-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
            {account.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
            <TabsTrigger value="balance">Balance Reconciliation</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <TransactionsTab accountId={id!} />
          </TabsContent>

          <TabsContent value="statements">
            <StatementsTab accountId={id!} />
          </TabsContent>

          <TabsContent value="balance">
            <BalanceReconciliationTab account={account} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
