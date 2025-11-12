import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

export type DatePreset = 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export const DATE_PRESETS: Record<string, { label: string; value: DatePreset }> = {
  LAST_7_DAYS: { label: 'Last 7 Days', value: 'last7days' },
  LAST_30_DAYS: { label: 'Last 30 Days', value: 'last30days' },
  THIS_MONTH: { label: 'This Month', value: 'thisMonth' },
  LAST_MONTH: { label: 'Last Month', value: 'lastMonth' },
  THIS_YEAR: { label: 'This Year', value: 'thisYear' },
  CUSTOM: { label: 'Custom Range', value: 'custom' },
};

export function getDateRangeFromPreset(preset: DatePreset): DateRange {
  const today = new Date();
  let start: string, end: string;

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
      start = format(startOfMonth(today), 'yyyy-MM-dd');
      end = format(endOfMonth(today), 'yyyy-MM-dd');
  }

  return { start, end };
}
