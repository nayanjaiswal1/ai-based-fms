import { useUrlFilters } from '@hooks/useUrlFilters';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: 'income' | 'expense' | 'both';
  groupBy?: 'day' | 'week' | 'month' | 'year';
  preset?: 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear' | 'lastMonth' | 'last3Months' | 'last6Months' | 'last12Months';
}

export function useAnalyticsFilters() {
  return useUrlFilters<AnalyticsFilters>();
}
