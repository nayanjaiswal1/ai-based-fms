import { TrendingUp, AlertTriangle, Target, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

interface PredictionsProps {
  predictions: {
    nextMonthExpenses: number;
    expectedSavings: number;
    budgetRisks: string[];
    confidence: number;
    byCategory: Array<{
      category: string;
      predictedAmount: number;
      confidence: number;
      historicalAverage: number;
      basis: string;
    }>;
  };
}

export const Predictions: React.FC<PredictionsProps> = ({ predictions }) => {
  const { symbol } = useCurrency();

  const chartData = predictions.byCategory.slice(0, 8).map((pred) => ({
    category: pred.category.length > 15 ? pred.category.substring(0, 12) + '...' : pred.category,
    predicted: pred.predictedAmount,
    historical: pred.historicalAverage,
  }));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 dark:bg-green-900';
    if (confidence >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Next Month Predictions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on 3-month historical analysis
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceBg(predictions.confidence)} ${getConfidenceColor(predictions.confidence)}`}>
          {predictions.confidence}% Confidence
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Projected Expenses
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {symbol()}{predictions.nextMonthExpenses.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Expected Savings
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {symbol()}{predictions.expectedSavings.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Risks */}
      {predictions.budgetRisks.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                Budget Risks Detected
              </h3>
              <ul className="space-y-1">
                {predictions.budgetRisks.map((risk, index) => (
                  <li key={index} className="text-sm text-yellow-800 dark:text-yellow-300">
                    • {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Chart */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Category-wise Predictions
        </h3>
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
              dataKey="predicted"
              fill="#8b5cf6"
              name="Predicted"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="historical"
              fill="#6366f1"
              name="Historical Avg"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Predictions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Detailed Breakdown
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {predictions.byCategory.slice(0, 6).map((pred, index) => {
            const difference = pred.predictedAmount - pred.historicalAverage;
            const percentChange = pred.historicalAverage > 0
              ? (difference / pred.historicalAverage) * 100
              : 0;

            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {pred.category}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getConfidenceBg(pred.confidence)} ${getConfidenceColor(pred.confidence)}`}>
                        {pred.confidence}% confidence
                      </span>
                      {percentChange !== 0 && (
                        <span className={`text-xs ${percentChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {symbol()}{pred.predictedAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      predicted
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Historical avg: {symbol()}{pred.historicalAverage.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          <strong>Note:</strong> Predictions are based on your spending patterns from the last 3 months.
          Actual expenses may vary based on seasonal changes, one-time purchases, and lifestyle adjustments.
        </p>
      </div>
    </div>
  );
};
