import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';

interface UseFormSubmitOptions<TData extends FieldValues, TResponse = any> {
  mutationFn: (data: TData) => Promise<TResponse>;
  queryKey?: string[];
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
  transform?: (data: TData) => any;
}

export function useFormSubmit<TData extends FieldValues, TResponse = any>({
  mutationFn,
  queryKey,
  onSuccess,
  onError,
  transform,
}: UseFormSubmitOptions<TData, TResponse>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: TData) => {
      const transformedData = transform ? transform(data) : data;
      return mutationFn(transformedData);
    },
    onSuccess: (data) => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
