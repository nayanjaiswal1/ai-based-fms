import { useCrud } from '@hooks/useCrud';
import { budgetsApi } from '@services/api';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  categoryId?: string;
  alertThreshold?: number;
  description?: string;
  spent?: number;
  remaining?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing budgets
 * Provides all CRUD operations and state management for budgets
 */
export function useBudgets() {
  return useCrud<Budget>({
    queryKey: 'budgets',
    api: budgetsApi,
  });
}
