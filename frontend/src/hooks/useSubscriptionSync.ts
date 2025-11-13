import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/services/subscriptionApi';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { SubscriptionTier } from '@/config/features.config';

/**
 * Hook to sync subscription data with backend
 * Automatically fetches and updates subscription state
 */
export function useSubscriptionSync() {
  const { setSubscription, setUsage } = useSubscriptionStore();
  const queryClient = useQueryClient();

  // Fetch subscription data
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getCurrent,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch usage data
  const { data: usageData, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: subscriptionApi.getUsage,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: ({ tier, billingCycle }: { tier: SubscriptionTier; billingCycle?: 'monthly' | 'yearly' }) =>
      subscriptionApi.upgrade(tier, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });

  // Downgrade mutation
  const downgradeMutation = useMutation({
    mutationFn: (tier: SubscriptionTier) => subscriptionApi.downgrade(tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  // Sync subscription data to store
  useEffect(() => {
    if (subscriptionData) {
      setSubscription({
        tier: subscriptionData.tier,
        status: subscriptionData.status,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        trialEndsAt: subscriptionData.trialEndsAt,
        features: subscriptionData.features,
      });
    }
  }, [subscriptionData, setSubscription]);

  // Sync usage data to store
  useEffect(() => {
    if (usageData) {
      setUsage({
        transactionsCount: usageData.transactionsCount,
        accountsCount: usageData.accountsCount,
        categoriesCount: usageData.categoriesCount,
        budgetsCount: usageData.budgetsCount,
      });
    }
  }, [usageData, setUsage]);

  return {
    subscription: subscriptionData,
    usage: usageData,
    isLoading: isLoadingSubscription || isLoadingUsage,
    upgrade: upgradeMutation.mutate,
    downgrade: downgradeMutation.mutate,
    cancel: cancelMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
    isDowngrading: downgradeMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

/**
 * Hook to manage addons
 */
export function useAddons() {
  const queryClient = useQueryClient();

  const { data: addons, isLoading } = useQuery({
    queryKey: ['subscription-addons'],
    queryFn: subscriptionApi.getAddons,
  });

  const purchaseMutation = useMutation({
    mutationFn: (addonId: string) => subscriptionApi.purchaseAddon(addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-addons'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (addonId: string) => subscriptionApi.removeAddon(addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-addons'] });
    },
  });

  return {
    addons,
    isLoading,
    purchase: purchaseMutation.mutate,
    remove: removeMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
