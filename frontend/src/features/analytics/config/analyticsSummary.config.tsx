import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { SummaryCardConfig } from '@components/cards';
import { getCurrencySymbol } from '@/stores/preferencesStore';

export interface AnalyticsSummaryData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
}

export const getAnalyticsSummaryCards = (
  data: AnalyticsSummaryData
): SummaryCardConfig[] => {
  const savingsRate =
    data.totalIncome > 0
      ? (data.netSavings / data.totalIncome) * 100
      : 0;

  return [
    {
      id: 'total-income',
      label: 'Total Income',
      value: data.totalIncome,
      icon: <TrendingUp className="h-5 w-5" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      formatter: (value) => {
        const num = Number(value ?? 0);
        return `${getCurrencySymbol()}${num.toFixed(2)}`;
      },
    },
    {
      id: 'total-expense',
      label: 'Total Expenses',
      value: data.totalExpense,
      icon: <TrendingDown className="h-5 w-5" />,
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      formatter: (value) => {
        const num = Number(value ?? 0);
        return `${getCurrencySymbol()}${num.toFixed(2)}`;
      },
    },
    {
      id: 'net-savings',
      label: 'Net Savings',
      value: data.netSavings,
      icon: <DollarSign className="h-5 w-5" />,
      iconBgColor: data.netSavings >= 0 ? 'bg-blue-100' : 'bg-yellow-100',
      iconColor: data.netSavings >= 0 ? 'text-blue-600' : 'text-yellow-600',
      valueColor: data.netSavings >= 0 ? 'text-blue-600' : 'text-yellow-600',
      formatter: (value) => {
        const num = Number(value ?? 0);
        return `${getCurrencySymbol()}${num.toFixed(2)}`;
      },
    },
    {
      id: 'savings-rate',
      label: 'Savings Rate',
      value: savingsRate,
      icon: <PieChart className="h-5 w-5" />,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600',
      formatter: (value) => {
        const num = Number(value ?? 0);
        return `${num.toFixed(1)}%`;
      },
    },
  ];
};
