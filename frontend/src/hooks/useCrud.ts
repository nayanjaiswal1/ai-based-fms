import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface CrudApi<T> {
  getAll: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  getOne?: (id: string) => Promise<ApiResponse<T>>;
  create: (data: Partial<T>) => Promise<ApiResponse<T>>;
  update: (id: string, data: Partial<T>) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

interface UseCrudOptions<T> {
  queryKey: string;
  api: CrudApi<T>;
  queryParams?: Record<string, unknown>;
  queryOptions?: Omit<UseQueryOptions<ApiResponse<T[]>>, 'queryKey' | 'queryFn'>;
}

/**
 * Reusable CRUD hook for consistent API operations
 */
export function useCrud<T>({ queryKey, api, queryParams, queryOptions }: UseCrudOptions<T>) {
  const queryClient = useQueryClient();

  // Get all items
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, queryParams],
    queryFn: () => api.getAll(queryParams),
    ...queryOptions,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return {
    // Data
    data: data?.data,
    isLoading,
    error,
    refetch,

    // Mutations
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
