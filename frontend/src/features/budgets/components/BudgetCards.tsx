import { format, parseISO } from 'date-fns';
import { Edit, Trash2, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  alertThreshold?: number;
  [key: string]: any;
}

interface BudgetCardsProps {
  budgets: Budget[];
  getCategoryName: (categoryId: string) => string;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  getBudgetProgressColor: (percentage: number) => string;
  getBudgetProgressTextColor: (percentage: number) => string;
  formatBudgetPeriod: (period: string) => string;
}

export default function BudgetCards({
  budgets,
  getCategoryName,
  onEdit,
  onDelete,
  getBudgetProgressColor,
  getBudgetProgressTextColor,
  formatBudgetPeriod,
}: BudgetCardsProps) {
  const { symbol } = useCurrency();

  if (budgets.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900">No budgets yet</p>
        <p className="mt-2 text-sm text-gray-500">
          Create your first budget to start tracking spending
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const percentage = (budget.spent / budget.amount) * 100;
        const remaining = budget.amount - budget.spent;
        const isOverBudget = percentage > 100;

        return (
          <div
            key={budget.id}
            className="rounded-lg bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {budget.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                  {getCategoryName(budget.categoryId || '')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(budget)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  aria-label="Edit budget"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(budget.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Delete budget"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Period */}
            <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{formatBudgetPeriod(budget.period)}</span>
            </div>

            {budget.startDate && budget.endDate && (
              <div className="mt-1 text-xs text-gray-500 pl-5 sm:pl-6">
                {format(parseISO(budget.startDate), 'MMM dd')} -{' '}
                {format(parseISO(budget.endDate), 'MMM dd, yyyy')}
              </div>
            )}

            {/* Amount and Percentage */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className={`font-medium ${getBudgetProgressTextColor(percentage)}`}>
                  {symbol()}{budget.spent.toFixed(2)} / {symbol()}{budget.amount.toFixed(2)}
                </span>
                <span className={`font-semibold ${getBudgetProgressTextColor(percentage)}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all ${getBudgetProgressColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {/* Remaining/Over Budget */}
              {isOverBudget ? (
                <div className="mt-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Over by {symbol()}{Math.abs(remaining).toFixed(2)}</span>
                </div>
              ) : (
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                  {symbol()}{remaining.toFixed(2)} remaining
                </p>
              )}
            </div>

            {/* Alert Threshold */}
            {budget.alertThreshold && (
              <div className="mt-3 sm:mt-4 rounded-lg bg-gray-50 p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    Alert at {budget.alertThreshold}% (
                    {symbol()}{((budget.amount * budget.alertThreshold) / 100).toFixed(2)})
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
