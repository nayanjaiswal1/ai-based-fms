import { useCrud } from '@hooks/useCrud';
import { accountsApi } from '@services/api';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'wallet' | 'cash' | 'card' | 'investment' | 'other';
  balance: number;
  currency: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing accounts
 * Provides all CRUD operations and state management for accounts
 */
export function useAccounts() {
  return useCrud<Account>({
    queryKey: 'accounts',
    api: accountsApi,
  });
}
