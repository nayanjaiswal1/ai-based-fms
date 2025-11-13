import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, transactionsApi } from '@services/api';
import { AlertTriangle, RefreshCw, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MergeConfirmModal from '../components/MergeConfirmModal';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  confidence: number;
}

interface DuplicateGroup {
  transactions: Transaction[];
  confidence: number;
}

export default function DuplicatesPage() {
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState(60);
  const [timeWindow, setTimeWindow] = useState(3);
  const [selectedPrimary, setSelectedPrimary] = useState<{ [groupIndex: number]: string }>({});
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeData, setMergeData] = useState<{ primaryId: string; duplicateIds: string[]; group: DuplicateGroup } | null>(null);

  const { data: duplicatesData, isLoading, refetch } = useQuery({
    queryKey: ['duplicates', threshold, timeWindow],
    queryFn: () => aiApi.detectDuplicates({ threshold, timeWindow, includeCategories: true }),
  });

  const mergeMutation = useMutation({
    mutationFn: ({ primaryId, duplicateIds }: { primaryId: string; duplicateIds: string[] }) =>
      transactionsApi.mergeTransactions(primaryId, duplicateIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicates'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions merged successfully');
      setShowMergeModal(false);
      setMergeData(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to merge transactions');
    },
  });

  const markNotDuplicateMutation = useMutation({
    mutationFn: ({ id, comparedWithId }: { id: string; comparedWithId: string }) =>
      transactionsApi.markNotDuplicate(id, comparedWithId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicates'] });
      toast.success('Transactions marked as not duplicates');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as not duplicates');
    },
  });

  const handleSelectPrimary = (groupIndex: number, transactionId: string) => {
    setSelectedPrimary({ ...selectedPrimary, [groupIndex]: transactionId });
  };

  const handleMerge = (groupIndex: number, group: DuplicateGroup) => {
    const primaryId = selectedPrimary[groupIndex] || group.transactions[0].id;
    const duplicateIds = group.transactions
      .filter(t => t.id !== primaryId)
      .map(t => t.id);

    setMergeData({ primaryId, duplicateIds, group });
    setShowMergeModal(true);
  };

  const confirmMerge = () => {
    if (mergeData) {
      mergeMutation.mutate({
        primaryId: mergeData.primaryId,
        duplicateIds: mergeData.duplicateIds,
      });
    }
  };

  const handleMarkNotDuplicates = (group: DuplicateGroup) => {
    // Mark all pairs in the group as not duplicates
    const transactions = group.transactions;

    // Safety check: ensure transactions array has at least one item
    if (!transactions || transactions.length === 0) {
      console.error('Cannot mark duplicates: transactions array is empty');
      return;
    }

    const primaryId = transactions[0].id;

    // Mark each duplicate with the primary
    transactions.slice(1).forEach(t => {
      markNotDuplicateMutation.mutate({ id: primaryId, comparedWithId: t.id });
    });
  };

  const handleAutoMergeAll = () => {
    if (!duplicatesData?.data) return;

    const highConfidenceGroups = duplicatesData.data.groups.filter((g: DuplicateGroup) => g.confidence >= 90);

    if (highConfidenceGroups.length === 0) {
      toast.error('No high confidence duplicates found (90%+)');
      return;
    }

    let merged = 0;
    highConfidenceGroups.forEach((group: DuplicateGroup) => {
      const primaryId = group.transactions[0].id;
      const duplicateIds = group.transactions.slice(1).map(t => t.id);

      mergeMutation.mutate(
        { primaryId, duplicateIds },
        {
          onSuccess: () => {
            merged++;
            if (merged === highConfidenceGroups.length) {
              toast.success(`Auto-merged ${merged} duplicate groups`);
            }
          },
        }
      );
    });
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

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

  const groups = duplicatesData?.data?.groups || [];
  const totalGroups = duplicatesData?.data?.totalGroups || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Potential Duplicates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and merge duplicate transactions to keep your records clean
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Detection Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confidence Threshold: {threshold}%
            </label>
            <input
              type="range"
              min="60"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>60% (Possible)</span>
              <span>100% (Exact)</span>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Time Window: {timeWindow} days
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>1 day</span>
              <span>7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {totalGroups > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Found {totalGroups} duplicate group{totalGroups !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleAutoMergeAll}
            disabled={mergeMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Auto-merge All (90%+ confidence)
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Detecting duplicates...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalGroups === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Duplicates Found</h3>
          <p className="mt-2 text-sm text-gray-600">
            Your transactions look clean! Try adjusting the threshold if you think there might be duplicates.
          </p>
        </div>
      )}

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {groups.map((group: DuplicateGroup, groupIndex: number) => {
          const primaryId = selectedPrimary[groupIndex] || group.transactions[0].id;

          return (
            <div
              key={groupIndex}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              {/* Group Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getConfidenceBadgeColor(
                      group.confidence
                    )}`}
                  >
                    {group.confidence}% Match
                  </span>
                  <span className="text-sm text-gray-600">
                    {group.transactions.length} transactions
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMerge(groupIndex, group)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Merge Selected
                  </button>
                  <button
                    onClick={() => handleMarkNotDuplicates(group)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Not Duplicates
                  </button>
                </div>
              </div>

              {/* Transactions */}
              <div className="space-y-3">
                {group.transactions.map((transaction) => {
                  const isPrimary = transaction.id === primaryId;

                  return (
                    <div
                      key={transaction.id}
                      className={`rounded-lg border p-4 transition-all ${
                        isPrimary
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name={`primary-${groupIndex}`}
                            checked={isPrimary}
                            onChange={() => handleSelectPrimary(groupIndex, transaction.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {transaction.description}
                              </h4>
                              {isPrimary && (
                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                              <div>
                                <span className="font-medium">Amount:</span>{' '}
                                {formatCurrency(transaction.amount)}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>{' '}
                                {formatDate(transaction.date)}
                              </div>
                              <div>
                                <span className="font-medium">Account:</span>{' '}
                                {transaction.accountName}
                              </div>
                              <div>
                                <span className="font-medium">Category:</span>{' '}
                                {transaction.categoryName}
                              </div>
                            </div>
                          </div>
                        </div>
                        {!isPrimary && (
                          <span className="ml-4 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {transaction.confidence}% match
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Merge Confirmation Modal */}
      {mergeData && (
        <MergeConfirmModal
          isOpen={showMergeModal}
          onClose={() => {
            setShowMergeModal(false);
            setMergeData(null);
          }}
          onConfirm={confirmMerge}
          primaryTransaction={mergeData.group.transactions.find(t => t.id === mergeData.primaryId)!}
          duplicateTransactions={mergeData.group.transactions.filter(t => t.id !== mergeData.primaryId)}
          isLoading={mergeMutation.isPending}
        />
      )}
    </div>
  );
}
