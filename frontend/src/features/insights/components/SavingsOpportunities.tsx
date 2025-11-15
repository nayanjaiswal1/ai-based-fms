import { PiggyBank, Clock, Zap, TrendingUp } from 'lucide-react';
import { SavingsOpportunity } from '../types/insights.types';
import { useCurrency } from '@/hooks/useCurrency';

interface SavingsOpportunitiesProps {
  opportunities: SavingsOpportunity[];
}

export const SavingsOpportunities: React.FC<SavingsOpportunitiesProps> = ({
  opportunities,
}) => {
  const { symbol } = useCurrency();

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-800 dark:text-green-200',
          label: 'Easy',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900',
          text: 'text-yellow-800 dark:text-yellow-200',
          label: 'Medium',
        };
      case 'hard':
        return {
          bg: 'bg-red-100 dark:bg-red-900',
          text: 'text-red-800 dark:text-red-200',
          label: 'Hard',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900',
          text: 'text-gray-800 dark:text-gray-200',
          label: difficulty,
        };
    }
  };

  const getTimeframeBadge = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate':
        return {
          icon: Zap,
          bg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-800 dark:text-blue-200',
          label: 'Immediate',
        };
      case 'short_term':
        return {
          icon: Clock,
          bg: 'bg-purple-100 dark:bg-purple-900',
          text: 'text-purple-800 dark:text-purple-200',
          label: 'Short Term',
        };
      case 'long_term':
        return {
          icon: TrendingUp,
          bg: 'bg-indigo-100 dark:bg-indigo-900',
          text: 'text-indigo-800 dark:text-indigo-200',
          label: 'Long Term',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-gray-100 dark:bg-gray-900',
          text: 'text-gray-800 dark:text-gray-200',
          label: timeframe,
        };
    }
  };

  const totalPotentialSavings = opportunities.reduce(
    (sum, opp) => sum + opp.potentialSavings,
    0,
  );

  if (opportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <PiggyBank className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Savings Opportunities
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Great job! No significant savings opportunities identified. Keep up the good work!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <PiggyBank className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Savings Opportunities
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {opportunities.length} opportunities found
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Potential Monthly Savings
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {symbol()}{totalPotentialSavings.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const difficulty = getDifficultyBadge(opportunity.difficulty);
          const timeframe = getTimeframeBadge(opportunity.timeframe);
          const TimeframeIcon = timeframe.icon;

          return (
            <div
              key={opportunity.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {opportunity.category}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${difficulty.bg} ${difficulty.text}`}
                    >
                      {difficulty.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${timeframe.bg} ${timeframe.text}`}
                    >
                      <TimeframeIcon className="w-3 h-3" />
                      {timeframe.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {opportunity.description}
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      💡 {opportunity.actionable}
                    </p>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {symbol()}{opportunity.potentialSavings.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">/month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Annual Savings Potential
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {symbol()}{(totalPotentialSavings * 12).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                If you implement all recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
