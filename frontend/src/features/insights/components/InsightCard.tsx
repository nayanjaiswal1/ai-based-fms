import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Target,
  PiggyBank,
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { Insight, InsightSeverity } from '../types/insights.types';
import { useCurrency } from '@/hooks/useCurrency';

interface InsightCardProps {
  insight: Insight;
  onActionClick?: (insight: Insight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onActionClick }) => {
  const [expanded, setExpanded] = useState(false);
  const { symbol } = useCurrency();

  const getSeverityStyles = (severity: InsightSeverity) => {
    switch (severity) {
      case InsightSeverity.SUCCESS:
        return {
          border: 'border-green-200 dark:border-green-800',
          bg: 'bg-green-50 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400',
          badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        };
      case InsightSeverity.WARNING:
        return {
          border: 'border-yellow-200 dark:border-yellow-800',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        };
      case InsightSeverity.ERROR:
        return {
          border: 'border-red-200 dark:border-red-800',
          bg: 'bg-red-50 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        };
      default:
        return {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'spending':
        return DollarSign;
      case 'budget':
        return Target;
      case 'savings':
        return PiggyBank;
      case 'anomaly':
        return AlertTriangle;
      case 'trend':
        return BarChart3;
      case 'health':
        return Activity;
      default:
        return Info;
    }
  };

  const getSeverityIcon = (severity: InsightSeverity) => {
    switch (severity) {
      case InsightSeverity.SUCCESS:
        return CheckCircle;
      case InsightSeverity.WARNING:
        return AlertTriangle;
      case InsightSeverity.ERROR:
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const styles = getSeverityStyles(insight.severity);
  const TypeIcon = getTypeIcon(insight.type);
  const SeverityIcon = getSeverityIcon(insight.severity);

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${styles.border} ${styles.bg}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${styles.badge}`}>
            <TypeIcon className={`w-5 h-5 ${styles.icon}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {insight.title}
              </h3>
              <SeverityIcon className={`w-4 h-4 ${styles.icon}`} />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {insight.description}
            </p>

            {insight.category && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles.badge} mr-2`}>
                {insight.category}
              </span>
            )}

            {insight.amount !== undefined && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles.badge}`}>
                {symbol()}{Math.abs(insight.amount).toFixed(2)}
                {insight.percentage !== undefined && (
                  <span className="ml-1">({Math.abs(insight.percentage).toFixed(1)}%)</span>
                )}
              </span>
            )}

            {expanded && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {insight.actionable && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Recommended Action:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {insight.actionable}
                    </p>
                  </div>
                )}

                {insight.impact && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Potential Impact:
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {insight.impact}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {(insight.actionable || onActionClick) && expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onActionClick?.(insight)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${styles.badge} hover:opacity-80`}
          >
            Take Action
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
