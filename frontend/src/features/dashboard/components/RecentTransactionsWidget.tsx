import { format } from 'date-fns';

interface Transaction {
  id: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
}

interface RecentTransactionsWidgetProps {
  transactions: Transaction[] | undefined;
  onViewAll: () => void;
}

export function RecentTransactionsWidget({ transactions, onViewAll }: RecentTransactionsWidgetProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {!transactions || transactions.length === 0 ? (
          <p className="text-center text-gray-500">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
              </div>
              <p
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
