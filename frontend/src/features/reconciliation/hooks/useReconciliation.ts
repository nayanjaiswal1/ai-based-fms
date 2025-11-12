import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reconciliationApi, StartReconciliationDto, UploadStatementDto, MatchTransactionDto, UnmatchTransactionDto, CompleteReconciliationDto, AdjustBalanceDto } from '../api/reconciliation.api';
import { toast } from 'react-hot-toast';

export const useReconciliation = (reconciliationId?: string) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get reconciliation
  const { data: reconciliation, isLoading: isLoadingReconciliation } = useQuery({
    queryKey: ['reconciliation', reconciliationId],
    queryFn: () => reconciliationApi.getReconciliation(reconciliationId!),
    enabled: !!reconciliationId,
  });

  // Start reconciliation
  const startReconciliationMutation = useMutation({
    mutationFn: (data: StartReconciliationDto) => reconciliationApi.startReconciliation(data),
    onSuccess: () => {
      toast.success('Reconciliation started successfully');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start reconciliation');
    },
  });

  // Upload statement
  const uploadStatementMutation = useMutation({
    mutationFn: ({ reconciliationId, data }: { reconciliationId: string; data: UploadStatementDto }) =>
      reconciliationApi.uploadStatement(reconciliationId, data),
    onSuccess: () => {
      toast.success('Statement uploaded and transactions matched');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload statement');
    },
  });

  // Match transaction
  const matchTransactionMutation = useMutation({
    mutationFn: ({ reconciliationId, data }: { reconciliationId: string; data: MatchTransactionDto }) =>
      reconciliationApi.matchTransaction(reconciliationId, data),
    onSuccess: () => {
      toast.success('Transaction matched successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to match transaction');
    },
  });

  // Unmatch transaction
  const unmatchTransactionMutation = useMutation({
    mutationFn: ({ reconciliationId, data }: { reconciliationId: string; data: UnmatchTransactionDto }) =>
      reconciliationApi.unmatchTransaction(reconciliationId, data),
    onSuccess: () => {
      toast.success('Transaction unmatched successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unmatch transaction');
    },
  });

  // Complete reconciliation
  const completeReconciliationMutation = useMutation({
    mutationFn: ({ reconciliationId, data }: { reconciliationId: string; data: CompleteReconciliationDto }) =>
      reconciliationApi.completeReconciliation(reconciliationId, data),
    onSuccess: () => {
      toast.success('Reconciliation completed successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-history'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete reconciliation');
    },
  });

  // Cancel reconciliation
  const cancelReconciliationMutation = useMutation({
    mutationFn: (reconciliationId: string) => reconciliationApi.cancelReconciliation(reconciliationId),
    onSuccess: () => {
      toast.success('Reconciliation cancelled');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel reconciliation');
    },
  });

  // Adjust balance
  const adjustBalanceMutation = useMutation({
    mutationFn: ({ reconciliationId, data }: { reconciliationId: string; data: AdjustBalanceDto }) =>
      reconciliationApi.adjustBalance(reconciliationId, data),
    onSuccess: () => {
      toast.success('Balance adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust balance');
    },
  });

  return {
    reconciliation,
    isLoadingReconciliation,
    startReconciliation: startReconciliationMutation.mutateAsync,
    uploadStatement: uploadStatementMutation.mutateAsync,
    matchTransaction: matchTransactionMutation.mutateAsync,
    unmatchTransaction: unmatchTransactionMutation.mutateAsync,
    completeReconciliation: completeReconciliationMutation.mutateAsync,
    cancelReconciliation: cancelReconciliationMutation.mutateAsync,
    adjustBalance: adjustBalanceMutation.mutateAsync,
    isLoading:
      isLoading ||
      startReconciliationMutation.isPending ||
      uploadStatementMutation.isPending ||
      matchTransactionMutation.isPending ||
      unmatchTransactionMutation.isPending ||
      completeReconciliationMutation.isPending ||
      cancelReconciliationMutation.isPending ||
      adjustBalanceMutation.isPending,
  };
};

export const useReconciliationHistory = (accountId?: string) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['reconciliation-history', accountId],
    queryFn: () => reconciliationApi.getReconciliationHistory(accountId!),
    enabled: !!accountId,
  });

  return {
    history: history || [],
    isLoading,
  };
};
