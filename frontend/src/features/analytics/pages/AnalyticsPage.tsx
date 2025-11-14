import { useQuery } from '@tanstack/react-query';
import { analyticsApi, exportApi } from '@services/api';
import { Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DATE_PRESETS, getDateRangeFromPreset, type DatePreset } from '../config/analytics.config';
import { SummaryCards } from '@components/cards';
import { getAnalyticsSummaryCards } from '../config/analyticsSummary.config';
import { useUrlParams } from '@/hooks/useUrlParams';
import { toast } from 'react-hot-toast';

export default function AnalyticsPage() {
  const { getParam, setParams } = useUrlParams();

  // Get date range from URL, default to 'thisMonth'
  const dateRange = (getParam('range') as DatePreset) || 'thisMonth';
  const startDate = getParam('startDate') || format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = getParam('endDate') || format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview', startDate, endDate],
    queryFn: () => analyticsApi.getOverview({ startDate, endDate }),
  });

  const { data: categoryBreakdown } = useQuery({
    queryKey: ['category-breakdown', startDate, endDate],
    queryFn: () => analyticsApi.getCategoryBreakdown({ startDate, endDate }),
  });

  const { data: trends } = useQuery({
    queryKey: ['trends', startDate, endDate],
    queryFn: () => analyticsApi.getTrends({ startDate, endDate }),
  });

  const { data: netWorth } = useQuery({
    queryKey: ['net-worth'],
    queryFn: analyticsApi.getNetWorth,
  });

  const handleDatePreset = (preset: DatePreset) => {
    const { start, end } = getDateRangeFromPreset(preset);
    setParams({
      range: preset,
      startDate: start,
      endDate: end,
    });
  };

  const handleStartDateChange = (value: string) => {
    setParams({
      range: 'custom',
      startDate: value,
    });
  };

  const handleEndDateChange = (value: string) => {
    setParams({
      range: 'custom',
      endDate: value,
    });
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      const exportFilters = {
        startDate,
        endDate,
        includeCharts: format === 'pdf',
      };

      let response;
      if (format === 'csv') {
        response = await exportApi.exportAnalyticsCSV(exportFilters);
      } else if (format === 'pdf') {
        response = await exportApi.exportAnalyticsPDF(exportFilters);
      }

      // Download the file
      if (response) {
        const blob = new Blob([response as any], {
          type: format === 'csv' ? 'text/csv' : 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Analytics exported as ${format.toUpperCase()} successfully!`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export analytics');
    }
  };

  const overviewData = overview?.data || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    transactionCount: 0,
  };

  const summaryCards = getAnalyticsSummaryCards(overviewData);

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {['last7days', 'last30days', 'thisMonth', 'lastMonth', 'thisYear'].map((preset) => (
              <button
                key={preset}
                onClick={() => handleDatePreset(preset)}
                className={`rounded-lg px-3 py-1 text-sm ${
                  dateRange === preset
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset === 'last7days' && 'Last 7 days'}
                {preset === 'last30days' && 'Last 30 days'}
                {preset === 'thisMonth' && 'This month'}
                {preset === 'lastMonth' && 'Last month'}
                {preset === 'thisYear' && 'This year'}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
            <span className="flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <SummaryCards cards={summaryCards} />

      {/* Net Worth Card */}
      {netWorth?.data && (
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg">
          <h2 className="text-lg font-semibold">Net Worth</h2>
          <p className="mt-2 text-4xl font-bold">${(netWorth.data.netWorth ?? 0).toFixed(2)}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-75">Assets</p>
              <p className="text-xl font-semibold">${(netWorth.data.totalAssets ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Liabilities</p>
              <p className="text-xl font-semibold">${(netWorth.data.totalLiabilities ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Investments</p>
              <p className="text-xl font-semibold">${(netWorth.data.totalInvestments ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Spending by Category</h2>
        <div className="mt-4 space-y-4">
          {categoryBreakdown?.data?.expenses?.map((category: any) => (
            <div key={category.categoryId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{category.categoryName}</span>
                <span className="text-gray-600">
                  ${(category.amount ?? 0).toFixed(2)} ({(category.percentage ?? 0).toFixed(1)}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${Math.min(category.percentage ?? 0, 100)}%` }}
                />
              </div>
            </div>
          ))}
          {(!categoryBreakdown?.data?.expenses ||
            categoryBreakdown.data.expenses.length === 0) && (
            <p className="text-center text-gray-500">No expense data for this period</p>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Trends</h2>
        <div className="mt-4">
          {trends?.data && trends.data.length > 0 ? (
            <div className="space-y-3">
              {trends.data.map((month: any) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      Income: ${(month.income ?? 0).toFixed(2)}
                    </span>
                    <span className="text-red-600">
                      Expenses: ${(month.expense ?? 0).toFixed(2)}
                    </span>
                    <span
                      className={`font-semibold ${
                        (month.savings ?? 0) >= 0 ? 'text-blue-600' : 'text-yellow-600'
                      }`}
                    >
                      Savings: ${(month.savings ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No trend data available</p>
          )}
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Summary</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="text-lg font-semibold text-gray-900">
                {overviewData.transactionCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Transaction</span>
              <span className="text-lg font-semibold text-gray-900">
                $
                {overviewData.transactionCount > 0
                  ? (
                      (overviewData.totalIncome + overviewData.totalExpense) /
                      overviewData.transactionCount
                    ).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
          <div className="mt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Income</p>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${
                        overviewData.totalIncome + overviewData.totalExpense > 0
                          ? (overviewData.totalIncome /
                              (overviewData.totalIncome + overviewData.totalExpense)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Expenses</p>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${
                        overviewData.totalIncome + overviewData.totalExpense > 0
                          ? (overviewData.totalExpense /
                              (overviewData.totalIncome + overviewData.totalExpense)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
