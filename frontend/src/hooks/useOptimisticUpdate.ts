import { useQueryClient, QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Optimistic Update Hook
 * Provides utilities for implementing optimistic UI updates
 * with automatic rollback on error
 */

interface OptimisticUpdateOptions<TData, TVariables> {
  queryKey: QueryKey;
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<TData = unknown, TVariables = unknown>({
  queryKey,
  updateFn,
  onError,
}: OptimisticUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  /**
   * Perform optimistic update
   * Returns rollback function to be called on error
   */
  const performOptimisticUpdate = useCallback(
    async (variables: TVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(queryKey, (oldData) => {
        return updateFn(oldData, variables);
      });

      // Return rollback function
      return () => {
        queryClient.setQueryData(queryKey, previousData);
      };
    },
    [queryClient, queryKey, updateFn],
  );

  /**
   * Rollback update and handle error
   */
  const handleError = useCallback(
    (error: Error, rollback: () => void) => {
      // Rollback to previous state
      rollback();

      // Call error handler
      if (onError) {
        onError(error);
      }

      // Log error
      console.error('Optimistic update failed:', error);
    },
    [onError],
  );

  return {
    performOptimisticUpdate,
    handleError,
  };
}

/**
 * Optimistic create hook
 */
export function useOptimisticCreate<TItem, TVariables>(
  queryKey: QueryKey,
  onError?: (error: Error) => void,
) {
  return useOptimisticUpdate<{ data: TItem[] }, TVariables>({
    queryKey,
    updateFn: (oldData, variables) => {
      if (!oldData) return oldData!;

      // Add optimistic item with temporary ID
      const optimisticItem = {
        ...variables,
        id: `temp-${Date.now()}`,
        __optimistic: true,
      } as TItem;

      return {
        ...oldData,
        data: [optimisticItem, ...(oldData.data || [])],
      };
    },
    onError,
  });
}

/**
 * Optimistic update hook
 */
export function useOptimisticModify<TItem extends { id: string }, TVariables>(
  queryKey: QueryKey,
  onError?: (error: Error) => void,
) {
  return useOptimisticUpdate<{ data: TItem[] }, TVariables & { id: string }>({
    queryKey,
    updateFn: (oldData, variables) => {
      if (!oldData) return oldData!;

      return {
        ...oldData,
        data: oldData.data.map((item) =>
          item.id === variables.id
            ? { ...item, ...variables, __optimistic: true }
            : item,
        ),
      };
    },
    onError,
  });
}

/**
 * Optimistic delete hook
 */
export function useOptimisticDelete<TItem extends { id: string }>(
  queryKey: QueryKey,
  onError?: (error: Error) => void,
) {
  return useOptimisticUpdate<{ data: TItem[] }, string>({
    queryKey,
    updateFn: (oldData, id) => {
      if (!oldData) return oldData!;

      return {
        ...oldData,
        data: oldData.data.filter((item) => item.id !== id),
      };
    },
    onError,
  });
}

/**
 * Hook for optimistic list mutations
 * Combines create, update, and delete operations
 */
export function useOptimisticList<TItem extends { id: string }, TCreateVars, TUpdateVars>(
  queryKey: QueryKey,
) {
  const queryClient = useQueryClient();

  const create = useOptimisticCreate<TItem, TCreateVars>(queryKey);
  const update = useOptimisticModify<TItem, TUpdateVars>(queryKey);
  const remove = useOptimisticDelete<TItem>(queryKey);

  /**
   * Replace optimistic item with real data
   */
  const replaceOptimistic = useCallback(
    (tempId: string, realItem: TItem) => {
      queryClient.setQueryData<{ data: TItem[] }>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((item) =>
            item.id === tempId ? realItem : item,
          ),
        };
      });
    },
    [queryClient, queryKey],
  );

  return {
    create,
    update,
    remove,
    replaceOptimistic,
  };
}

export default useOptimisticUpdate;
