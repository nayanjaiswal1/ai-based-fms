import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';

interface EntityApi<TData, TResponse = TData> {
  create: (data: TData) => Promise<TResponse>;
  update: (id: string | number, data: TData) => Promise<TResponse>;
}

interface UseEntityFormOptions<TData extends FieldValues> {
  api: EntityApi<TData>;
  queryKey: string[];
  entityId?: string | number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  transform?: (data: TData) => any;
}

export function useEntityForm<TData extends FieldValues>({
  api,
  queryKey,
  entityId,
  onSuccess,
  onError,
  transform,
}: UseEntityFormOptions<TData>) {
  const queryClient = useQueryClient();
  const isEditMode = !!entityId;

  const createMutation = useMutation({
    mutationFn: (data: TData) => {
      const transformedData = transform ? transform(data) : data;
      return api.create(transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.();
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: (data: TData) => {
      const transformedData = transform ? transform(data) : data;
      return api.update(entityId!, transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.();
    },
    onError,
  });

  const handleSubmit = async (data: TData) => {
    if (isEditMode) {
      return updateMutation.mutateAsync(data);
    } else {
      return createMutation.mutateAsync(data);
    }
  };

  return {
    handleSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
    isError: createMutation.isError || updateMutation.isError,
    error: createMutation.error || updateMutation.error,
    isEditMode,
  };
}
