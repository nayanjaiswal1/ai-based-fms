import { useUrlFilters } from '@hooks/useUrlFilters';

export interface AccountFilters {
  type?: 'bank' | 'card' | 'wallet' | 'cash';
  currency?: string;
  search?: string;
  minBalance?: number;
  maxBalance?: number;
}

export function useAccountFilters() {
  return useUrlFilters<AccountFilters>();
}
