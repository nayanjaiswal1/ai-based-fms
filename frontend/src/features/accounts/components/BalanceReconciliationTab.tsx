import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@services/api';
import { AlertCircle, CheckCircle, DollarSign, TrendingUp, TrendingDown, Save } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'react-hot-toast';

interface BalanceReconciliationTabProps {
  account: any;
}

export const BalanceReconciliationTab = ({ account }: BalanceReconciliationTabProps) => {
  const { formatLocale } = useCurrency();
  const queryClient = useQueryClient();
  const [actualBalance, setActualBalance] = useState(account.balance?.toString() || '0');
  const [notes, setNotes] = useState('');

  const systemBalance = Number(account.balance) || 0;
  const enteredBalance = Number(actualBalance) || 0;
  const difference = enteredBalance - systemBalance;

  // Mutation to update account balance
  const updateBalanceMutation = useMutation({
    mutationFn: (data: { actualBalance: number; notes?: string }) =>
      accountsApi.update(account.id, {
        balance: data.actualBalance,
        lastReconciledAt: new Date().toISOString(),
        lastReconciledBalance: data.actualBalance,
      }),
    onSuccess: () => {
      toast.success('Account balance updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['account', account.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update balance');
    },
  });

  const handleUpdateBalance = () => {
    if (isNaN(enteredBalance)) {
      toast.error('Please enter a valid balance amount');
      return;
    }

    if (enteredBalance === systemBalance) {
      toast.success('Balance already matches!');
      return;
    }

    updateBalanceMutation.mutate({
      actualBalance: enteredBalance,
      notes,
    });
  };

  const getDifferenceColor = () => {
    if (Math.abs(difference) < 0.01) return 'text-green-600';
    return difference > 0 ? 'text-blue-600' : 'text-red-600';
  };

  const getDifferenceIcon = () => {
    if (Math.abs(difference) < 0.01) return <CheckCircle className="h-5 w-5" />;
    return difference > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Balance Reconciliation
            </h4>
            <p className="text-sm text-blue-700">
              Enter your actual account balance from your bank statement or online banking.
              The system will calculate the difference and help you identify missing transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Balance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-medium text-gray-600">System Balance</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatLocale(systemBalance)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on recorded transactions
          </p>
        </div>

        <div className="bg-white border-2 border-blue-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-600">Actual Balance</p>
          </div>
          <input
            type="number"
            step="0.01"
            value={actualBalance}
            onChange={(e) => setActualBalance(e.target.value)}
            placeholder="Enter actual balance"
            className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none p-0"
          />
          <p className="text-xs text-gray-500 mt-1">
            From your bank statement
          </p>
        </div>

        <div className={`rounded-lg p-4 ${Math.abs(difference) < 0.01 ? 'bg-green-50' : 'bg-orange-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {getDifferenceIcon()}
            <p className={`text-sm font-medium ${getDifferenceColor()}`}>
              Difference
            </p>
          </div>
          <p className={`text-2xl font-bold ${getDifferenceColor()}`}>
            {difference >= 0 ? '+' : ''}
            {formatLocale(difference)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {Math.abs(difference) < 0.01
              ? 'Balances match perfectly!'
              : difference > 0
              ? 'Missing expense transactions'
              : 'Missing income transactions'}
          </p>
        </div>
      </div>

      {/* Notes Section */}
      {Math.abs(difference) >= 0.01 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this balance adjustment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Action Buttons */}
      {Math.abs(difference) >= 0.01 && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateBalance}
            disabled={updateBalanceMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {updateBalanceMutation.isPending ? 'Updating...' : 'Update Balance'}
          </button>
          <button
            onClick={() => {
              setActualBalance(systemBalance.toString());
              setNotes('');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          How to use Balance Reconciliation
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Check your bank statement or online banking for the current balance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Enter that balance in the "Actual Balance" field above</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Review the difference - it shows what transactions are missing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <span>Click "Update Balance" to sync with your actual balance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">5.</span>
            <span>Add the missing transactions manually or import them from a statement</span>
          </li>
        </ul>
      </div>

      {/* Last Reconciliation Info */}
      {account.lastReconciledAt && (
        <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p>
            Last reconciled: {new Date(account.lastReconciledAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {account.lastReconciledBalance && (
            <p className="mt-1">
              Last reconciled balance: {formatLocale(Number(account.lastReconciledBalance))}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
