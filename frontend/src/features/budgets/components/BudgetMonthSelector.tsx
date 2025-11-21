import { Calendar, DollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface BudgetMonthSelectorProps {
  budgetMonth: string;
  setBudgetMonth: (month: string) => void;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
}

export function BudgetMonthSelector({
  budgetMonth,
  setBudgetMonth,
  monthlyIncome,
  setMonthlyIncome,
}: BudgetMonthSelectorProps) {
  const { symbol } = useCurrency();

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Month */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Calendar className="h-4 w-4 text-blue-600" />
          Budget Month
        </label>
        <input
          type="month"
          value={budgetMonth}
          onChange={(e) => setBudgetMonth(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
        />
      </div>

      {/* Income */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <DollarSign className="h-4 w-4 text-green-600" />
          Monthly Income
          <span className="text-xs font-normal text-gray-500">(for AI generation)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            {symbol()}
          </span>
          <input
            type="number"
            value={monthlyIncome || ''}
            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
            placeholder="5000"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base"
          />
        </div>
      </div>
    </div>
  );
}
