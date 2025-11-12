import { useCrud } from '@hooks/useCrud';
import { categoriesApi } from '@services/api';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'both';
  color: string;
  icon?: string;
  parentId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing categories
 * Provides all CRUD operations and state management for categories
 */
export function useCategories() {
  return useCrud<Category>({
    queryKey: 'categories',
    api: categoriesApi,
  });
}
