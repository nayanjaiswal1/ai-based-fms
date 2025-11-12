import { useCrud } from '@hooks/useCrud';
import { groupsApi } from '@services/api';

export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing groups
 * Provides all CRUD operations and state management for groups
 */
export function useGroups() {
  return useCrud<Group>({
    queryKey: 'groups',
    api: groupsApi,
  });
}
