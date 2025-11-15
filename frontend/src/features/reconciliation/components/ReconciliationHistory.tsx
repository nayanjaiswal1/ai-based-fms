import React from 'react';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign, Eye } from 'lucide-react';
import { useReconciliationHistory } from '../hooks/useReconciliation';
import { useCurrency } from '@/hooks/useCurrency';

interface ReconciliationHistoryProps {
  accountId: string;
  onViewDetails?: (reconciliationId: string) => void;
}

export const ReconciliationHistory: React.FC<ReconciliationHistoryProps> = ({
  accountId,
  onViewDetails,
}) => {
  const { symbol } = useCurrency();
  const { history, isLoading } = useReconciliationHistory(accountId);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.cancelled;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reconciliation History</h3>
        <p className="text-gray-600">
          You haven't reconciled this account yet. Start your first reconciliation to see the
          history here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Reconciliation History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((reconciliation: any) => (
          <div key={reconciliation.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(reconciliation.status)}
                  {reconciliation.difference !== undefined &&
                    reconciliation.difference !== null &&
                    Math.abs(reconciliation.difference) < 0.01 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Balanced
                      </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Period</div>
                      <div className="font-medium text-gray-900">
                        {new Date(reconciliation.startDate).toLocaleDateString()} -{' '}
                        {new Date(reconciliation.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Statement Balance</div>
                      <div className="font-medium text-gray-900">
                        {symbol()}{reconciliation.statementBalance.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Matched</div>
                      <div className="font-medium text-gray-900">
                        {reconciliation.matchedCount} / {reconciliation.statementTransactionCount}
                      </div>
                    </div>
                  </div>

                  {reconciliation.difference !== undefined &&
                    reconciliation.difference !== null && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <div>
                          <div className="text-xs text-gray-500">Difference</div>
                          <div
                            className={`font-medium ${
                              Math.abs(reconciliation.difference) < 0.01
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {symbol()}{Math.abs(reconciliation.difference).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {reconciliation.completedAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Completed on {new Date(reconciliation.completedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(reconciliation.id)}
                  className="ml-4 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
