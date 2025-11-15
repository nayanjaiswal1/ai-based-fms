import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface Props {
  data?: CashFlowData[];
  config?: Record<string, any>;
}

export function CashFlowWidget({ data = [], config }: Props) {
  const { symbol } = useCurrency();
  const latestMonth = data[data.length - 1];
  const netCashFlow = latestMonth?.net || 0;
  const isPositive = netCashFlow >= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Cash Flow'}
        </h3>
        <DollarSign className="h-5 w-5 text-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4 text-green-600" />
            <span className="text-xs text-gray-600">Income</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            {symbol()}{latestMonth?.income?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="h-4 w-4 text-red-600" />
            <span className="text-xs text-gray-600">Expenses</span>
          </div>
          <p className="text-lg font-bold text-red-600">
            {symbol()}{latestMonth?.expenses?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-1">Net Cash Flow</p>
        <p className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{symbol()}{netCashFlow.toFixed(2)}
        </p>
      </div>

      {data.length > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="net"
                stroke={isPositive ? "#10B981" : "#EF4444"}
                fillOpacity={1}
                fill="url(#colorNet)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No cash flow data available</p>
        </div>
      )}
    </div>
  );
}
