import { useMemo } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import {
  FeatureFlag,
  SubscriptionTier,
  FEATURE_ACCESS,
  getRequiredTier,
  getTierDisplayName,
} from '@/config/features.config';

interface FeatureAccessResult {
  hasAccess: boolean;
  tier: SubscriptionTier;
  requiredTier?: SubscriptionTier;
  requiresUpgrade: boolean;
  reason?: string;
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeatureAccess(feature: FeatureFlag): FeatureAccessResult {
  const { subscription } = useSubscriptionStore();
  const { user } = useAuthStore();

  return useMemo(() => {
    const userTier = subscription?.tier || SubscriptionTier.FREE;
    const isAdmin = user?.role === 'admin';

    // Admins have access to all features
    if (isAdmin) {
      return {
        hasAccess: true,
        tier: userTier,
        requiresUpgrade: false,
      };
    }

    const allowedTiers = FEATURE_ACCESS[feature] || [];
    const hasAccess = allowedTiers.includes(userTier);
    const requiredTier = getRequiredTier(feature);

    if (hasAccess) {
      return {
        hasAccess: true,
        tier: userTier,
        requiresUpgrade: false,
      };
    }

    return {
      hasAccess: false,
      tier: userTier,
      requiredTier,
      requiresUpgrade: true,
      reason: `This feature requires ${getTierDisplayName(requiredTier)} plan`,
    };
  }, [feature, subscription?.tier, user?.role]);
}

/**
 * Hook to check if user has access to multiple features
 */
export function useMultipleFeatureAccess(features: FeatureFlag[]): Record<FeatureFlag, boolean> {
  const { subscription } = useSubscriptionStore();

  return useMemo(() => {
    return features.reduce((acc, feature) => {
      const allowedTiers = FEATURE_ACCESS[feature];
      acc[feature] = allowedTiers.includes(subscription.tier);
      return acc;
    }, {} as Record<FeatureFlag, boolean>);
  }, [features, subscription.tier]);
}

/**
 * Hook to check subscription status
 */
export function useSubscriptionStatus() {
  const { subscription, usage, isTrialActive, hasReachedLimit, getRemainingUsage } =
    useSubscriptionStore();

  return useMemo(
    () => ({
      tier: subscription.tier,
      status: subscription.status,
      isActive: subscription.status === 'active',
      isTrial: subscription.status === 'trial',
      isTrialActive: isTrialActive(),
      trialEndsAt: subscription.trialEndsAt,
      usage,
      limits: subscription.limits,
      hasReachedLimit,
      getRemainingUsage,
    }),
    [subscription, usage, isTrialActive, hasReachedLimit, getRemainingUsage]
  );
}

/**
 * Hook to get all accessible features for current tier
 */
export function useAccessibleFeatures(): FeatureFlag[] {
  const { subscription } = useSubscriptionStore();

  return useMemo(() => {
    return Object.entries(FEATURE_ACCESS)
      .filter(([_, tiers]) => tiers.includes(subscription.tier))
      .map(([feature]) => feature as FeatureFlag);
  }, [subscription.tier]);
}

/**
 * Hook to check if upgrade is available
 */
export function useUpgradeInfo(targetFeature?: FeatureFlag) {
  const { subscription } = useSubscriptionStore();

  return useMemo(() => {
    const currentTier = subscription.tier;
    const tiers = [
      SubscriptionTier.FREE,
      SubscriptionTier.BASIC,
      SubscriptionTier.PREMIUM,
      SubscriptionTier.ENTERPRISE,
    ];

    const currentIndex = tiers.indexOf(currentTier);
    const canUpgrade = currentIndex < tiers.length - 1;
    const nextTier = canUpgrade ? tiers[currentIndex + 1] : null;

    let suggestedTier = nextTier;
    if (targetFeature) {
      const requiredTier = getRequiredTier(targetFeature);
      const requiredIndex = tiers.indexOf(requiredTier);
      if (requiredIndex > currentIndex) {
        suggestedTier = requiredTier;
      }
    }

    return {
      currentTier,
      canUpgrade,
      nextTier,
      suggestedTier,
      targetFeature,
    };
  }, [subscription.tier, targetFeature]);
}
