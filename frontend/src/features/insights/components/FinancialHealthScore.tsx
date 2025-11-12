import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { FinancialHealth } from '../types/insights.types';

interface FinancialHealthScoreProps {
  health: FinancialHealth;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ health }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'needs_improvement':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getTrendIcon = () => {
    switch (health.trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    if (health.trend.change === 0) return 'No change from last month';
    const direction = health.trend.change > 0 ? 'up' : 'down';
    return `${Math.abs(health.trend.change)} points ${direction} from last month`;
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Financial Health Score
        </h2>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {showBreakdown ? (
            <>
              Hide Details <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Details <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke={getScoreColor(health.score)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {health.score}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">out of 100</div>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className={`text-lg font-semibold capitalize ${getStatusColor(health.status)}`}>
          {health.status.replace('_', ' ')}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
          {getTrendIcon()}
          <span>{getTrendText()}</span>
        </div>
      </div>

      {showBreakdown && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Score Breakdown
          </h3>

          {/* Savings Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Savings Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.breakdown.savingsRate.score}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(health.breakdown.savingsRate.score * 4)}`}
                style={{ width: `${(health.breakdown.savingsRate.score / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Current: {health.breakdown.savingsRate.value.toFixed(1)}%
            </p>
          </div>

          {/* Budget Adherence */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Budget Adherence</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.breakdown.budgetAdherence.score}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(health.breakdown.budgetAdherence.score * 4)}`}
                style={{ width: `${(health.breakdown.budgetAdherence.score / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              On track: {health.breakdown.budgetAdherence.value.toFixed(1)}%
            </p>
          </div>

          {/* Expense Ratio */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Expense Management</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.breakdown.expenseRatio.score}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(health.breakdown.expenseRatio.score * 4)}`}
                style={{ width: `${(health.breakdown.expenseRatio.score / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Expense ratio: {health.breakdown.expenseRatio.value.toFixed(1)}%
            </p>
          </div>

          {/* Financial Stability */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Financial Stability</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.breakdown.stability.score}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(health.breakdown.stability.score * 4)}`}
                style={{ width: `${(health.breakdown.stability.score / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Stability: {health.breakdown.stability.value.toFixed(1)}%
            </p>
          </div>

          {/* Recommendations */}
          {health.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {health.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
