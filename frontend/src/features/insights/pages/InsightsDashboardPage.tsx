import { useState } from 'react';
import { Lightbulb, RefreshCw, Download, Filter } from 'lucide-react';
import { useInsights, useFinancialHealth, useGenerateInsights } from '../hooks/useInsights';
import { InsightCard } from '../components/InsightCard';
import { FinancialHealthScore } from '../components/FinancialHealthScore';
import { SavingsOpportunities } from '../components/SavingsOpportunities';
import { TrendCharts } from '../components/TrendCharts';
import { Predictions } from '../components/Predictions';
import { InsightType, InsightSeverity } from '../types/insights.types';
import { format, subMonths } from 'date-fns';

export default function InsightsDashboardPage() {
  const [selectedTypes, setSelectedTypes] = useState<InsightType[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<InsightSeverity | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');

  const { data: insights, isLoading, error } = useInsights({
    startDate,
    endDate,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    useAI: true,
    includePredictions: true,
  });

  const { data: healthData } = useFinancialHealth();
  const generateInsights = useGenerateInsights();

  const handleRefresh = () => {
    generateInsights.mutate({
      startDate,
      endDate,
      useAI: true,
      includePredictions: true,
    });
  };

  const handleTypeFilter = (type: InsightType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filteredInsights = insights?.insights.filter((insight) => {
    if (selectedSeverity !== 'all' && insight.severity !== selectedSeverity) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
          Error Loading Insights
        </h3>
        <p className="text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to load insights'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={handleRefresh}
            disabled={generateInsights.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${generateInsights.isPending ? 'animate-spin' : ''}`} />
            {generateInsights.isPending ? 'Generating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insight Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(InsightType).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSeverity('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSeverity === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {Object.values(InsightSeverity).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setSelectedSeverity(severity)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSeverity === severity
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Insights
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {insights.summary.totalInsights}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Success
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {insights.summary.bySeverity.success || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Warnings
            </p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {insights.summary.bySeverity.warning || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Errors
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {insights.summary.bySeverity.error || 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Score - Takes 1 column */}
        {healthData && (
          <div className="lg:col-span-1">
            <FinancialHealthScore health={healthData} />
          </div>
        )}

        {/* Key Insights - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Key Insights ({filteredInsights?.length || 0})
            </h2>

            {!filteredInsights || filteredInsights.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No insights available. Try adjusting your filters or refresh to generate new insights.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Opportunities */}
      {insights?.savingsOpportunities && insights.savingsOpportunities.length > 0 && (
        <SavingsOpportunities opportunities={insights.savingsOpportunities} />
      )}

      {/* Trends */}
      {insights?.categoryTrends && insights.categoryTrends.length > 0 && (
        <TrendCharts trends={insights.categoryTrends} />
      )}

      {/* Predictions */}
      {insights?.predictions && (
        <Predictions predictions={insights.predictions} />
      )}

      {/* Period Info */}
      {insights && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Insights generated for period:{' '}
            <span className="font-medium">
              {format(new Date(insights.period.startDate), 'MMM dd, yyyy')} -{' '}
              {format(new Date(insights.period.endDate), 'MMM dd, yyyy')}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Last updated: {format(new Date(insights.generatedAt), 'MMM dd, yyyy hh:mm a')}
          </p>
        </div>
      )}
    </div>
  );
}
