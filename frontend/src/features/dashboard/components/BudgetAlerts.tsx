import { AlertTriangle } from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

interface BudgetAlertsProps {
  budgets: Budget[];
  onViewBudgets: () => void;
}

export function BudgetAlerts({ budgets, onViewBudgets }: BudgetAlertsProps) {
  if (budgets.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <div className="flex-1">
          <p className="font-semibold text-yellow-900">Budget Alerts</p>
          <p className="text-sm text-yellow-700">
            {budgets.length} budget(s) approaching or exceeding limits
          </p>
        </div>
        <button
          onClick={onViewBudgets}
          className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
        >
          View Budgets
        </button>
      </div>
    </div>
  );
}
