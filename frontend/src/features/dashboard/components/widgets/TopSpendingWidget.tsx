import { TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface Props {
  data?: CategorySpending[];
  config?: Record<string, any>;
}

export function TopSpendingWidget({ data = [], config }: Props) {
  const navigate = useNavigate();
  const { symbol } = useCurrency();

  const topCategories = data.slice(0, 5);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Top Spending Categories'}
        </h3>
        <TrendingDown className="h-5 w-5 text-red-500" />
      </div>

      <div className="space-y-3">
        {topCategories.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{item.category}</span>
              <span className="text-gray-600">{symbol()}{item.amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color || '#3B82F6',
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {topCategories.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No spending data available
        </p>
      )}

      <button
        onClick={() => navigate('/analytics')}
        className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View Full Report
      </button>
    </div>
  );
}
