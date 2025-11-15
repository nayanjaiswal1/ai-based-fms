import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface MatchCardProps {
  statementTransaction: {
    id: string;
    statementAmount: number;
    statementDate: string;
    statementDescription: string;
    matched: boolean;
    matchConfidence?: string;
    confidenceScore?: number;
    transaction?: any;
  };
  onMatch?: (reconciliationTransactionId: string, transactionId: string) => void;
  onUnmatch?: (reconciliationTransactionId: string) => void;
  availableTransactions?: any[];
}

export const MatchCard: React.FC<MatchCardProps> = ({
  statementTransaction,
  onMatch,
  onUnmatch,
  availableTransactions = [],
}) => {
  const { symbol } = useCurrency();

  const getConfidenceBadge = (confidence?: string, score?: number) => {
    if (!confidence) return null;

    const colors: Record<string, string> = {
      exact: 'bg-green-100 text-green-800',
      high: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-orange-100 text-orange-800',
      manual: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[confidence] || 'bg-gray-100 text-gray-800'}`}>
        {confidence.toUpperCase()} {score ? `(${score.toFixed(0)}%)` : ''}
      </span>
    );
  };

  return (
    <div className={`p-4 border rounded-lg ${statementTransaction.matched ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {statementTransaction.matched ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium text-gray-900">
              {statementTransaction.statementDescription}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
            <div>
              <span className="font-medium">Amount:</span> {symbol()}
              {Math.abs(statementTransaction.statementAmount).toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Date:</span>{' '}
              {new Date(statementTransaction.statementDate).toLocaleDateString()}
            </div>
          </div>

          {statementTransaction.matchConfidence && (
            <div className="mb-2">
              {getConfidenceBadge(
                statementTransaction.matchConfidence,
                statementTransaction.confidenceScore
              )}
            </div>
          )}

          {statementTransaction.matched && statementTransaction.transaction && (
            <div className="mt-2 p-2 bg-white rounded border border-green-200">
              <div className="text-xs text-gray-500 mb-1">Matched Transaction:</div>
              <div className="text-sm">
                <div className="font-medium">{statementTransaction.transaction.description}</div>
                <div className="text-gray-600">
                  {symbol()}{Math.abs(statementTransaction.transaction.amount).toFixed(2)} on{' '}
                  {new Date(statementTransaction.transaction.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {!statementTransaction.matched && availableTransactions.length > 0 && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Transaction to Match:
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value && onMatch) {
                    onMatch(statementTransaction.id, e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="">Select a transaction...</option>
                {availableTransactions.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    {tx.description} - {symbol()}{Math.abs(tx.amount).toFixed(2)} ({new Date(tx.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="ml-4">
          {statementTransaction.matched && onUnmatch && (
            <button
              onClick={() => onUnmatch(statementTransaction.id)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            >
              Unmatch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
