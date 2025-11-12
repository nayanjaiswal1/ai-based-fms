import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type TransactionDatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const TRANSACTION_DATE_PRESETS = [
  { value: 'today' as const, label: 'Today' },
  { value: 'yesterday' as const, label: 'Yesterday' },
  { value: 'last7days' as const, label: 'Last 7 days' },
  { value: 'last30days' as const, label: 'Last 30 days' },
  { value: 'thisMonth' as const, label: 'This month' },
  { value: 'lastMonth' as const, label: 'Last month' },
  { value: 'thisYear' as const, label: 'This year' },
];

export function getTransactionDateRange(preset: TransactionDatePreset): DateRange {
  const today = new Date();
  let startDate: string, endDate: string;

  switch (preset) {
    case 'today':
      startDate = endDate = format(today, 'yyyy-MM-dd');
      break;
    case 'yesterday':
      startDate = endDate = format(subDays(today, 1), 'yyyy-MM-dd');
      break;
    case 'last7days':
      startDate = format(subDays(today, 7), 'yyyy-MM-dd');
      endDate = format(today, 'yyyy-MM-dd');
      break;
    case 'last30days':
      startDate = format(subDays(today, 30), 'yyyy-MM-dd');
      endDate = format(today, 'yyyy-MM-dd');
      break;
    case 'thisMonth':
      startDate = format(startOfMonth(today), 'yyyy-MM-dd');
      endDate = format(endOfMonth(today), 'yyyy-MM-dd');
      break;
    case 'lastMonth':
      const lastMonth = subDays(startOfMonth(today), 1);
      startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
      break;
    case 'thisYear':
      startDate = format(startOfYear(today), 'yyyy-MM-dd');
      endDate = format(endOfYear(today), 'yyyy-MM-dd');
      break;
  }

  return { startDate, endDate };
}
