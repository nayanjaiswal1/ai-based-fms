import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface NetWorthData {
  month: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

interface Props {
  data?: NetWorthData[];
  config?: Record<string, any>;
}

export function NetWorthTrackerWidget({ data = [], config }: Props) {
  const navigate = useNavigate();

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const currentNetWorth = latestData?.netWorth || 0;
  const previousNetWorth = previousData?.netWorth || 0;
  const change = currentNetWorth - previousNetWorth;
  const changePercentage = previousNetWorth !== 0
    ? ((change / previousNetWorth) * 100)
    : 0;

  const isPositive = change >= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Net Worth Tracker'}
        </h3>
        <TrendingUp className="h-5 w-5 text-purple-500" />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Current Net Worth</p>
        <p className="text-2xl font-bold text-gray-900">
          ${currentNetWorth.toFixed(2)}
        </p>
        {previousData && (
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}${change.toFixed(2)} ({isPositive ? '+' : ''}{changePercentage.toFixed(2)}%)
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Assets</p>
          <p className="text-sm font-semibold text-blue-600">
            ${latestData?.assets?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="p-2 bg-red-50 rounded">
          <p className="text-xs text-gray-600">Liabilities</p>
          <p className="text-sm font-semibold text-red-600">
            ${latestData?.liabilities?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {data.length > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No net worth data available</p>
        </div>
      )}

      <button
        onClick={() => navigate('/analytics')}
        className="mt-3 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View Detailed Report
      </button>
    </div>
  );
}
