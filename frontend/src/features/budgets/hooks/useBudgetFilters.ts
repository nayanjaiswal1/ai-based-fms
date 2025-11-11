import { useUrlFilters } from '@hooks/useUrlFilters';

export interface BudgetFilters {
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  categoryId?: string;
  status?: 'active' | 'exceeded' | 'warning'; // <75%, >=100%, 75-99%
  search?: string;
}

export function useBudgetFilters() {
  return useUrlFilters<BudgetFilters>();
}
