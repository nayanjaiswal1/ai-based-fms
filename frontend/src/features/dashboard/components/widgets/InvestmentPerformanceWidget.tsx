import { TrendingUp, TrendingDown } from 'lucide-react';

interface InvestmentData {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

interface Props {
  data?: InvestmentData;
  config?: Record<string, any>;
}

export function InvestmentPerformanceWidget({ data, config }: Props) {
  const invested = data?.totalInvested || 0;
  const currentValue = data?.currentValue || 0;
  const totalReturn = data?.totalReturn || 0;
  const returnPercentage = data?.returnPercentage || 0;
  const dayChange = data?.dayChange || 0;
  const dayChangePercentage = data?.dayChangePercentage || 0;

  const isPositive = totalReturn >= 0;
  const isDayPositive = dayChange >= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Investment Performance'}
        </h3>
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-green-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-500" />
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Portfolio Value</p>
        <p className="text-2xl font-bold text-gray-900">${currentValue.toFixed(2)}</p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Total Invested</span>
          <span className="text-sm font-semibold text-gray-900">
            ${invested.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Total Return</span>
          <div className="text-right">
            <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${totalReturn.toFixed(2)}
            </p>
            <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{returnPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Today's Change</span>
          <div className="text-right">
            <p className={`text-sm font-semibold ${isDayPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isDayPositive ? '+' : ''}${dayChange.toFixed(2)}
            </p>
            <p className={`text-xs ${isDayPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isDayPositive ? '+' : ''}{dayChangePercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {currentValue === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No investment data available</p>
        </div>
      )}
    </div>
  );
}
