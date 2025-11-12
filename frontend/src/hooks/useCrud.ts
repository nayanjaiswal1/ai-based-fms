import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { getCacheConfig, invalidateRelatedQueries } from '@config/queryClient';

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
  enableOptimistic?: boolean;
  relatedQueryType?: 'transaction' | 'account' | 'budget' | 'category';
}

/**
 * Reusable CRUD hook with optimistic updates and smart caching
 */
export function useCrud<T extends { id?: string }>({
  queryKey,
  api,
  queryParams,
  queryOptions,
  enableOptimistic = true,
  relatedQueryType,
}: UseCrudOptions<T>) {
  const queryClient = useQueryClient();

  // Get cache config for this query type
  const cacheConfig = getCacheConfig(queryKey);

  // Get all items with optimized cache configuration
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, queryParams],
    queryFn: () => api.getAll(queryParams),
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.cacheTime,
    ...queryOptions,
  });

  // Create mutation with optimistic updates
  const createMutation = useMutation({
    mutationFn: api.create,
    onMutate: async (newItem) => {
      if (!enableOptimistic) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ApiResponse<T[]>>([queryKey, queryParams]);

      // Optimistically update
      if (previousData) {
        const optimisticItem = {
          ...newItem,
          id: `temp-${Date.now()}`,
          __optimistic: true,
        } as T;

        queryClient.setQueryData<ApiResponse<T[]>>([queryKey, queryParams], {
          ...previousData,
          data: [optimisticItem, ...previousData.data],
        });
      }

      return { previousData };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([queryKey, queryParams], context.previousData);
      }
      console.error('Create failed:', err);
    },
    onSuccess: (result, variables, context) => {
      if (enableOptimistic && context?.previousData) {
        // Replace optimistic item with real data
        const previousData = context.previousData;
        queryClient.setQueryData<ApiResponse<T[]>>([queryKey, queryParams], {
          ...previousData,
          data: previousData.data.map((item: any) =>
            item.__optimistic ? result.data : item
          ),
        });
      }

      // Invalidate related queries
      if (relatedQueryType) {
        invalidateRelatedQueries(queryClient, relatedQueryType);
      } else {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
    },
  });

  // Update mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => api.update(id, data),
    onMutate: async ({ id, data: updateData }) => {
      if (!enableOptimistic) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ApiResponse<T[]>>([queryKey, queryParams]);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<ApiResponse<T[]>>([queryKey, queryParams], {
          ...previousData,
          data: previousData.data.map((item) =>
            item.id === id ? { ...item, ...updateData, __optimistic: true } : item
          ),
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([queryKey, queryParams], context.previousData);
      }
      console.error('Update failed:', err);
    },
    onSuccess: (result) => {
      // Invalidate related queries
      if (relatedQueryType) {
        invalidateRelatedQueries(queryClient, relatedQueryType);
      } else {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
    },
  });

  // Delete mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onMutate: async (id) => {
      if (!enableOptimistic) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ApiResponse<T[]>>([queryKey, queryParams]);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<ApiResponse<T[]>>([queryKey, queryParams], {
          ...previousData,
          data: previousData.data.filter((item) => item.id !== id),
        });
      }

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([queryKey, queryParams], context.previousData);
      }
      console.error('Delete failed:', err);
    },
    onSuccess: () => {
      // Invalidate related queries
      if (relatedQueryType) {
        invalidateRelatedQueries(queryClient, relatedQueryType);
      } else {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
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

    // Raw mutations for advanced use
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
