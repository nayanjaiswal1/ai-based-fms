import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@services/api';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

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

  const handleDatePreset = (preset: string) => {
    setDateRange(preset);
    const today = new Date();
    let start, end;

    switch (preset) {
      case 'last7days':
        start = format(subDays(today, 7), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'last30days':
        start = format(subDays(today, 30), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'thisYear':
        start = format(startOfYear(today), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const overviewData = overview?.data || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    transactionCount: 0,
  };

  const savingsRate =
    overviewData.totalIncome > 0
      ? (overviewData.netSavings / overviewData.totalIncome) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Insights and trends for your financial data
          </p>
        </div>
      </div>

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
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateRange('custom');
              }}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
            <span className="flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateRange('custom');
              }}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                ${overviewData.totalIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${overviewData.totalExpense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                overviewData.netSavings >= 0 ? 'bg-blue-100' : 'bg-yellow-100'
              }`}
            >
              <DollarSign
                className={`h-5 w-5 ${
                  overviewData.netSavings >= 0 ? 'text-blue-600' : 'text-yellow-600'
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Savings</p>
              <p
                className={`text-2xl font-bold ${
                  overviewData.netSavings >= 0 ? 'text-blue-600' : 'text-yellow-600'
                }`}
              >
                ${overviewData.netSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Card */}
      {netWorth?.data && (
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg">
          <h2 className="text-lg font-semibold">Net Worth</h2>
          <p className="mt-2 text-4xl font-bold">${netWorth.data.netWorth.toFixed(2)}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-75">Assets</p>
              <p className="text-xl font-semibold">${netWorth.data.totalAssets.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Liabilities</p>
              <p className="text-xl font-semibold">${netWorth.data.totalLiabilities.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Investments</p>
              <p className="text-xl font-semibold">${netWorth.data.totalInvestments.toFixed(2)}</p>
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
                  ${category.amount.toFixed(2)} ({category.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
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
                      Income: ${month.income.toFixed(2)}
                    </span>
                    <span className="text-red-600">
                      Expenses: ${month.expense.toFixed(2)}
                    </span>
                    <span
                      className={`font-semibold ${
                        month.savings >= 0 ? 'text-blue-600' : 'text-yellow-600'
                      }`}
                    >
                      Savings: ${month.savings.toFixed(2)}
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
