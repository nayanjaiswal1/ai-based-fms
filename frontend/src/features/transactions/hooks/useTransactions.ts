import { useCrud } from '@hooks/useCrud';
import { transactionsApi } from '@services/api';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  accountId: string;
  categoryId: string;
  tagIds?: string[];
  tags?: Array<{ id: string; name: string; color: string }>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing transactions
 * Provides all CRUD operations and state management for transactions
 */
export function useTransactions() {
  return useCrud<Transaction>({
    queryKey: 'transactions',
    api: transactionsApi,
  });
}
