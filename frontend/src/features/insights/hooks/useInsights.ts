import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insightsApi } from '@services/api';
import { InsightsResponse, InsightsOptions } from '../types/insights.types';
import { toast } from 'react-hot-toast';

export const useInsights = (options?: InsightsOptions) => {
  return useQuery<InsightsResponse>({
    queryKey: ['insights', options],
    queryFn: () => insightsApi.getAll(options),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSpendingInsights = (options?: InsightsOptions) => {
  return useQuery({
    queryKey: ['insights', 'spending', options],
    queryFn: () => insightsApi.getSpending(options),
    staleTime: 1000 * 60 * 60,
  });
};

export const useBudgetInsights = () => {
  return useQuery({
    queryKey: ['insights', 'budget'],
    queryFn: () => insightsApi.getBudget(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useSavingsInsights = (options?: InsightsOptions) => {
  return useQuery({
    queryKey: ['insights', 'savings', options],
    queryFn: () => insightsApi.getSavings(options),
    staleTime: 1000 * 60 * 60,
  });
};

export const useAnomalyInsights = (options?: InsightsOptions) => {
  return useQuery({
    queryKey: ['insights', 'anomalies', options],
    queryFn: () => insightsApi.getAnomalies(options),
    staleTime: 1000 * 60 * 60,
  });
};

export const useTrendInsights = () => {
  return useQuery({
    queryKey: ['insights', 'trends'],
    queryFn: () => insightsApi.getTrends(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useFinancialHealth = () => {
  return useQuery({
    queryKey: ['insights', 'health'],
    queryFn: () => insightsApi.getHealth(),
    staleTime: 1000 * 60 * 60,
  });
};

export const usePredictions = () => {
  return useQuery({
    queryKey: ['insights', 'predictions'],
    queryFn: () => insightsApi.getPredictions(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useGenerateInsights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: InsightsOptions) => insightsApi.generate(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Insights generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate insights');
    },
  });
};
