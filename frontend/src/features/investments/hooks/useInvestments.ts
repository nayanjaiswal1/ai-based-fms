import { useCrud } from '@hooks/useCrud';
import { investmentsApi } from '@services/api';

export interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other';
  symbol?: string;
  investedAmount: number;
  currentValue: number;
  quantity?: number;
  purchaseDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing investments
 * Provides all CRUD operations and state management for investments
 */
export function useInvestments() {
  return useCrud<Investment>({
    queryKey: 'investments',
    api: investmentsApi,
  });
}
