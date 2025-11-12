import React from 'react';
import { CheckCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';

interface ReconciliationSummaryProps {
  reconciliation: any;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({
  reconciliation,
  onComplete,
  onCancel,
}) => {
  if (!reconciliation) return null;

  const difference = reconciliation.difference || 0;
  const isBalanced = Math.abs(difference) < 0.01;
  const matchRate = reconciliation.statementTransactionCount
    ? Math.round((reconciliation.matchedCount / reconciliation.statementTransactionCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`p-6 rounded-lg ${
          isBalanced
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}
      >
        <div className="flex items-start gap-4">
          {isBalanced ? (
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold mb-2 ${
                isBalanced ? 'text-green-900' : 'text-yellow-900'
              }`}
            >
              {isBalanced ? 'Reconciliation Balanced!' : 'Discrepancy Found'}
            </h3>
            <p className={isBalanced ? 'text-green-700' : 'text-yellow-700'}>
              {isBalanced
                ? 'Your account is perfectly reconciled. All transactions match the statement.'
                : `There is a difference of $${Math.abs(difference).toFixed(2)} between your account and the statement.`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Statement Balance</p>
              <p className="text-lg font-bold text-gray-900">
                ${reconciliation.statementBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Reconciled Balance</p>
              <p className="text-lg font-bold text-gray-900">
                ${(reconciliation.reconciledBalance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${isBalanced ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
              <AlertCircle
                className={`w-5 h-5 ${isBalanced ? 'text-green-600' : 'text-red-600'}`}
              />
            </div>
            <div>
              <p className="text-xs text-gray-600">Difference</p>
              <p
                className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}
              >
                ${Math.abs(difference).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Match Rate</p>
              <p className="text-lg font-bold text-gray-900">{matchRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">
                {reconciliation.statementTransactionCount}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Transactions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{reconciliation.matchedCount}</p>
              <p className="text-sm text-gray-600 mt-1">Matched</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">
                {reconciliation.unmatchedCount}
              </p>
              <p className="text-sm text-gray-600 mt-1">Unmatched</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span className="text-sm">
            Reconciliation Period:{' '}
            <span className="font-medium text-gray-900">
              {new Date(reconciliation.startDate).toLocaleDateString()} -{' '}
              {new Date(reconciliation.endDate).toLocaleDateString()}
            </span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {reconciliation.status === 'in_progress' && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            disabled={reconciliation.unmatchedCount > 0 && !isBalanced}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Complete Reconciliation
          </button>
        </div>
      )}

      {/* Completion Info */}
      {reconciliation.status === 'completed' && reconciliation.completedAt && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Reconciliation completed on{' '}
              {new Date(reconciliation.completedAt).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
