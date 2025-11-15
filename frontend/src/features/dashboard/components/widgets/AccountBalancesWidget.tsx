import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface Props {
  accounts?: Account[];
  config?: Record<string, any>;
}

export function AccountBalancesWidget({ accounts = [], config }: Props) {
  const navigate = useNavigate();
  const { symbol } = useCurrency();

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Account Balances'}
        </h3>
        <Wallet className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Total Balance</p>
        <p className="text-2xl font-bold text-gray-900">{symbol()}{totalBalance.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        {accounts.slice(0, 4).map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/accounts/${account.id}`)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{account.name}</p>
              <p className="text-xs text-gray-500">{account.type}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {symbol()}{Number(account.balance).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {accounts.length > 4 && (
        <button
          onClick={() => navigate('/accounts')}
          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All {accounts.length} Accounts
        </button>
      )}
    </div>
  );
}
