import React, { useMemo } from 'react';
import { MatchCard } from './MatchCard';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface TransactionMatchingProps {
  reconciliation: any;
  onMatch: (reconciliationTransactionId: string, transactionId: string) => void;
  onUnmatch: (reconciliationTransactionId: string) => void;
}

export const TransactionMatching: React.FC<TransactionMatchingProps> = ({
  reconciliation,
  onMatch,
  onUnmatch,
}) => {
  const matchedTransactions = useMemo(() => {
    return reconciliation?.reconciliationTransactions?.filter((rt: any) => rt.matched) || [];
  }, [reconciliation]);

  const unmatchedTransactions = useMemo(() => {
    return reconciliation?.reconciliationTransactions?.filter((rt: any) => !rt.matched) || [];
  }, [reconciliation]);

  // Get all matched transaction IDs to filter available transactions
  const matchedTransactionIds = useMemo(() => {
    return new Set(matchedTransactions.map((rt: any) => rt.transactionId).filter(Boolean));
  }, [matchedTransactions]);

  // Available transactions are those in the account that are not yet matched
  const availableTransactions = useMemo(() => {
    // This would ideally come from the reconciliation data
    // For now, we'll return an empty array as the backend would need to provide this
    return [];
  }, []);

  const matchRate = reconciliation?.statementTransactionCount
    ? Math.round((matchedTransactions.length / reconciliation.statementTransactionCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {reconciliation?.statementTransactionCount || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Matched</p>
              <p className="text-2xl font-bold text-green-600">{matchedTransactions.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unmatched</p>
              <p className="text-2xl font-bold text-orange-600">{unmatchedTransactions.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Matching Progress</span>
          <span className="text-sm font-medium text-gray-900">{matchRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${matchRate}%` }}
          ></div>
        </div>
      </div>

      {/* Unmatched Transactions */}
      {unmatchedTransactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Unmatched Transactions ({unmatchedTransactions.length})
          </h3>
          <div className="space-y-3">
            {unmatchedTransactions.map((rt: any) => (
              <MatchCard
                key={rt.id}
                statementTransaction={rt}
                onMatch={onMatch}
                availableTransactions={availableTransactions}
              />
            ))}
          </div>
        </div>
      )}

      {/* Matched Transactions */}
      {matchedTransactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Matched Transactions ({matchedTransactions.length})
          </h3>
          <div className="space-y-3">
            {matchedTransactions.map((rt: any) => (
              <MatchCard key={rt.id} statementTransaction={rt} onUnmatch={onUnmatch} />
            ))}
          </div>
        </div>
      )}

      {reconciliation?.reconciliationTransactions?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No statement transactions uploaded yet.</p>
        </div>
      )}
    </div>
  );
};
