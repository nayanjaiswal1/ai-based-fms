import { PiggyBank } from 'lucide-react';

interface Props {
  income?: number;
  expenses?: number;
  savings?: number;
  config?: Record<string, any>;
}

export function SavingsRateWidget({ income = 0, expenses = 0, savings = 0, config }: Props) {
  const savingsRate = income > 0 ? ((savings / income) * 100) : 0;
  const targetRate = config?.targetRate || 20;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Savings Rate'}
        </h3>
        <PiggyBank className="h-5 w-5 text-green-500" />
      </div>

      <div className="text-center mb-4">
        <div className="relative inline-flex items-center justify-center">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="52"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="52"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - savingsRate / 100)}`}
              className={savingsRate >= targetRate ? 'text-green-500' : 'text-yellow-500'}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {savingsRate.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">of income</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Income</span>
          <span className="font-semibold text-gray-900">${income.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expenses</span>
          <span className="font-semibold text-gray-900">${expenses.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Saved</span>
          <span className="font-semibold text-green-600">${savings.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-600">Target Rate</span>
            <span className="font-semibold text-gray-900">{targetRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
