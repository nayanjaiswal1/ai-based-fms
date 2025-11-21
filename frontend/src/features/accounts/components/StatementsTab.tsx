import { useQuery } from '@tanstack/react-query';
import { reconciliationApi } from '@services/api';
import { FileText, Download, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface StatementsTabProps {
  accountId: string;
}

export const StatementsTab = ({ accountId }: StatementsTabProps) => {
  const { formatLocale } = useCurrency();

  // Fetch reconciliation history (which includes statement uploads)
  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ['reconciliation-history', accountId],
    queryFn: () => reconciliationApi.getHistory(accountId),
    enabled: !!accountId,
  });

  const history = historyResponse?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading statements...</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900">No statements uploaded</p>
        <p className="mt-2 text-sm text-gray-500">
          Statements will appear here when you upload them during reconciliation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Statement History</h3>
        <p className="text-sm text-gray-500">{history.length} statement(s) uploaded</p>
      </div>

      <div className="space-y-3">
        {history.map((reconciliation: any) => (
          <div
            key={reconciliation.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-lg p-2 bg-blue-50 flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Statement Period
                    </h4>
                    {getStatusBadge(reconciliation.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(reconciliation.startDate)} - {formatDate(reconciliation.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Statement Balance</p>
                      <p className="font-medium text-gray-900">
                        {formatLocale(Number(reconciliation.statementBalance))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Matched</p>
                      <p className="font-medium text-gray-900">
                        {reconciliation.matchedCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Unmatched</p>
                      <p className="font-medium text-gray-900">
                        {reconciliation.unmatchedCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Difference</p>
                      <p className={`font-medium ${Number(reconciliation.difference) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatLocale(Math.abs(Number(reconciliation.difference)))}
                      </p>
                    </div>
                  </div>
                  {reconciliation.notes && (
                    <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                      {reconciliation.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-gray-500">
                <p>Created {formatDate(reconciliation.createdAt)}</p>
                {reconciliation.completedAt && (
                  <p>Completed {formatDate(reconciliation.completedAt)}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
