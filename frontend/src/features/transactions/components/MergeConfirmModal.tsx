import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  accountName: string;
  categoryName: string;
}

interface MergeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  primaryTransaction: Transaction;
  duplicateTransactions: Transaction[];
  isLoading?: boolean;
}

export default function MergeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  primaryTransaction,
  duplicateTransactions,
  isLoading = false,
}: MergeConfirmModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Confirm Merge</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Warning Message */}
          <div className="mb-6 rounded-lg bg-orange-50 border border-orange-200 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">You are about to merge {duplicateTransactions.length} transaction{duplicateTransactions.length !== 1 ? 's' : ''}</p>
                <p className="mt-1">
                  The duplicate transactions will be marked as merged and removed from your transaction list.
                  The primary transaction will remain. You can unmerge within 30 days if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Transaction */}
          <div className="mb-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Primary Transaction (Will be kept)
            </h3>
            <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      {primaryTransaction.description}
                    </h4>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(primaryTransaction.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {formatDate(primaryTransaction.date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {primaryTransaction.accountName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {primaryTransaction.categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Transactions */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Transactions to be Merged (Will be removed)
            </h3>
            <div className="space-y-3">
              {duplicateTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {transaction.accountName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {transaction.categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What happens next:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>The primary transaction will remain in your transaction list</li>
                  <li>{duplicateTransactions.length} duplicate transaction{duplicateTransactions.length !== 1 ? 's' : ''} will be marked as merged</li>
                  <li>Account balances will be adjusted to remove duplicates</li>
                  <li>You can unmerge within 30 days if this was a mistake</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Merging...' : 'Confirm Merge'}
          </button>
        </div>
      </div>
    </div>
  );
}
