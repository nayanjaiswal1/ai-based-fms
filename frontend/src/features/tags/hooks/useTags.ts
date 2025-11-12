import { useCrud } from '@hooks/useCrud';
import { tagsApi } from '@services/api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing tags
 * Provides all CRUD operations and state management for tags
 */
export function useTags() {
  return useCrud<Tag>({
    queryKey: 'tags',
    api: tagsApi,
  });
}
