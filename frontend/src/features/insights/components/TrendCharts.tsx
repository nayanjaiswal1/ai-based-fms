import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CategoryTrend } from '../types/insights.types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface TrendChartsProps {
  trends: CategoryTrend[];
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ trends }) => {
  const { symbol } = useCurrency();

  // Prepare data for the chart
  const chartData = trends.slice(0, 8).map((trend) => ({
    category: trend.category.length > 15 ? trend.category.substring(0, 12) + '...' : trend.category,
    currentMonth: trend.currentMonth,
    lastMonth: trend.lastMonth,
    threeMonthAvg: trend.threeMonthAvg,
  }));

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 dark:text-red-400';
      case 'decreasing':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Category Spending Trends
      </h2>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="category"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => `${symbol()}${value.toFixed(2)}`}
            />
            <Legend />
            <Bar
              dataKey="currentMonth"
              fill="#3b82f6"
              name="Current Month"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="lastMonth"
              fill="#8b5cf6"
              name="Last Month"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="threeMonthAvg"
              fill="#10b981"
              name="3-Month Avg"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Details */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Trend Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trends.slice(0, 6).map((trend) => (
            <div
              key={trend.category}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {trend.category}
                    </h4>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <p className={`text-xs font-medium ${getTrendColor(trend.trend)}`}>
                    {trend.trend === 'increasing' && (
                      <>↑ {Math.abs(trend.changePercentage).toFixed(1)}% increase</>
                    )}
                    {trend.trend === 'decreasing' && (
                      <>↓ {Math.abs(trend.changePercentage).toFixed(1)}% decrease</>
                    )}
                    {trend.trend === 'stable' && <>Stable</>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {symbol()}{trend.currentMonth.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    this month
                  </p>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Last month: {symbol()}{trend.lastMonth.toFixed(0)}</span>
                <span>3mo avg: {symbol()}{trend.threeMonthAvg.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Increasing
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {trends.filter((t) => t.trend === 'increasing').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Stable
            </p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {trends.filter((t) => t.trend === 'stable').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Decreasing
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {trends.filter((t) => t.trend === 'decreasing').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
