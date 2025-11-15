import { useCurrency } from '@/hooks/useCurrency';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface AccountsWidgetProps {
  accounts: Account[] | undefined;
  onViewAll: () => void;
  maxDisplay?: number;
}

export function AccountsWidget({ accounts, onViewAll, maxDisplay = 4 }: AccountsWidgetProps) {
  const { symbol } = useCurrency();
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accounts</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {!accounts || accounts.length === 0 ? (
          <p className="text-center text-gray-500">No accounts</p>
        ) : (
          accounts.slice(0, maxDisplay).map((account) => (
            <div key={account.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium text-gray-900">{account.name}</p>
                <p className="text-sm capitalize text-gray-500">{account.type}</p>
              </div>
              <p className="font-semibold text-gray-900">{symbol()}{Number(account.balance).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
