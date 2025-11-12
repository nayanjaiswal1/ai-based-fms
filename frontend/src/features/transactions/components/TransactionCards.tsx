import { format } from 'date-fns';
import { Edit, Trash2, History, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { VirtualCardList } from '@/components/virtual';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  accountId?: string;
  isMerged?: boolean;
  mergedTransactions?: any[];
  hasHistory?: boolean;
  [key: string]: any;
}

interface TransactionCardsProps {
  transactions: Transaction[];
  getCategoryName: (categoryId: string) => string;
  getAccountName: (accountId: string) => string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onHistory: (transaction: Transaction) => void;
  onUnmerge?: (id: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectOne?: (id: string) => void;
}

export default function TransactionCards({
  transactions,
  getCategoryName,
  getAccountName,
  onEdit,
  onDelete,
  onHistory,
  onUnmerge,
  selectable,
  selectedIds = [],
  onSelectOne,
}: TransactionCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No transactions found. Add your first transaction to get started.</p>
      </div>
    );
  }

  // Use virtual scrolling for large datasets (>50 items on mobile)
  const useVirtualScrolling = transactions.length > 50;

  // Render card content
  const renderCard = (transaction: Transaction, index: number) => {
    const isIncome = transaction.type === 'income';
    const isExpanded = expandedId === transaction.id;
    const isSelected = selectedIds.includes(transaction.id);
    const isMerged = transaction.isMerged;

    return (
      <div
        className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
        }`}
      >
        {/* Main Content */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Checkbox + Icon + Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Checkbox for selection */}
            {selectable && onSelectOne && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectOne(transaction.id)}
                className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label={`Select transaction ${transaction.description}`}
              />
            )}

            {/* Type Icon */}
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                isIncome ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isIncome ? (
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              )}
            </div>

            {/* Transaction Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {transaction.description}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {getCategoryName(transaction.categoryId || '')}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-lg font-semibold ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>{getAccountName(transaction.accountId || '')}</span>
                <span>•</span>
                <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                {isMerged && transaction.mergedTransactions && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <CheckCircle className="h-3 w-3" />
                      Merged ({transaction.mergedTransactions.length})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>

          {transaction.hasHistory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHistory(transaction);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </button>
          )}

          {isMerged && onUnmerge && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnmerge(transaction.id);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <span>Unmerge</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    );
  };

  // Use VirtualCardList for large datasets
  if (useVirtualScrolling) {
    return (
      <VirtualCardList
        items={transactions}
        renderCard={renderCard}
        keyExtractor={(transaction) => transaction.id}
        cardHeight={180}
        height="calc(100vh - 300px)"
        enableDynamicSize={true}
        overscan={5}
        gap={12}
        selectable={selectable}
        selectedIds={selectedIds}
        onSelectCard={onSelectOne}
        className="space-y-3"
      />
    );
  }

  // Regular rendering for smaller datasets
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          {renderCard(transaction, transactions.indexOf(transaction))}
        </div>
      ))}
    </div>
  );
}
