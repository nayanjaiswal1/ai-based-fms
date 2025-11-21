import { PieChart, Info, TrendingUp, Lightbulb } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface AIResponse {
  income: number;
  fixedExpenses: {
    savings: number;
    debt: number;
    regular: number;
    total: number;
  };
  summary: {
    totalAllocated: number;
    remaining: number;
    distribution: {
      needs: number;
      wants: number;
      savings: number;
    };
  };
  recommendations: string[];
}

interface AIInsightsProps {
  aiResponse: AIResponse | null;
}

export function AIInsights({ aiResponse }: AIInsightsProps) {
  const { symbol } = useCurrency();

  if (!aiResponse) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Distribution */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Distribution</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Needs</span>
              <span className="font-bold text-blue-900">
                {symbol()}
                {aiResponse.summary.distribution.needs.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Wants</span>
              <span className="font-bold text-blue-900">
                {symbol()}
                {aiResponse.summary.distribution.wants.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Savings</span>
              <span className="font-bold text-blue-900">
                {symbol()}
                {aiResponse.summary.distribution.savings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Expenses */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-orange-900">Fixed Expenses</h3>
          </div>
          <div className="space-y-2">
            {aiResponse.fixedExpenses.savings > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-800">Savings</span>
                <span className="font-bold text-orange-900">
                  {symbol()}
                  {aiResponse.fixedExpenses.savings.toLocaleString()}
                </span>
              </div>
            )}
            {aiResponse.fixedExpenses.debt > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-800">Debt</span>
                <span className="font-bold text-orange-900">
                  {symbol()}
                  {aiResponse.fixedExpenses.debt.toLocaleString()}
                </span>
              </div>
            )}
            {aiResponse.fixedExpenses.regular > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-800">Regular</span>
                <span className="font-bold text-orange-900">
                  {symbol()}
                  {aiResponse.fixedExpenses.regular.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t-2 border-orange-200">
              <span className="text-sm font-bold text-orange-800">Total</span>
              <span className="font-bold text-orange-900">
                {symbol()}
                {aiResponse.fixedExpenses.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-green-900">Budget Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-800">Income</span>
              <span className="font-bold text-green-900">
                {symbol()}
                {aiResponse.income.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-800">Allocated</span>
              <span className="font-bold text-green-900">
                {symbol()}
                {aiResponse.summary.totalAllocated.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t-2 border-green-200">
              <span className="text-sm font-bold text-green-800">Remaining</span>
              <span className="font-bold text-green-900">
                {symbol()}
                {aiResponse.summary.remaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {aiResponse.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-purple-900">AI Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {aiResponse.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-sm text-purple-800">
                <span className="text-purple-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
