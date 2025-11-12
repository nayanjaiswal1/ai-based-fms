interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

interface BudgetProgressWidgetProps {
  budgets: Budget[] | undefined;
  onViewAll: () => void;
  maxDisplay?: number;
}

export function BudgetProgressWidget({ budgets, onViewAll, maxDisplay = 3 }: BudgetProgressWidgetProps) {
  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Budget Progress</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {!budgets || budgets.length === 0 ? (
          <p className="text-center text-gray-500">No budgets created</p>
        ) : (
          budgets.slice(0, maxDisplay).map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;

            return (
              <div key={budget.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{budget.name}</span>
                  <span className="text-gray-600">
                    ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${getColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
