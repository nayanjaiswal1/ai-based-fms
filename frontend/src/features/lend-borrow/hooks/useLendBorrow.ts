import { useCrud } from '@hooks/useCrud';
import { lendBorrowApi } from '@services/api';

export interface LendBorrowRecord {
  id: string;
  type: 'lent' | 'borrowed';
  personName: string;
  amount: number;
  dueDate?: string;
  description?: string;
  interestRate?: number;
  status?: 'pending' | 'settled' | 'partially_settled';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing lend/borrow records
 * Provides all CRUD operations and state management for lend/borrow transactions
 */
export function useLendBorrow() {
  return useCrud<LendBorrowRecord>({
    queryKey: 'lend-borrow',
    api: lendBorrowApi,
  });
}
