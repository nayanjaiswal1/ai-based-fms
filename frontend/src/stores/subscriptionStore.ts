import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SubscriptionTier, FEATURE_LIMITS } from '@/config/features.config';

interface SubscriptionData {
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'trial' | 'cancelled';
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  features: string[];
  limits: typeof FEATURE_LIMITS[SubscriptionTier];
}

interface UsageStats {
  transactionsCount: number;
  accountsCount: number;
  categoriesCount: number;
  budgetsCount: number;
}

interface SubscriptionState {
  subscription: SubscriptionData;
  usage: UsageStats;
  setSubscription: (subscription: Partial<SubscriptionData>) => void;
  setUsage: (usage: Partial<UsageStats>) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
  isTrialActive: () => boolean;
  hasReachedLimit: (resource: keyof typeof FEATURE_LIMITS[SubscriptionTier]) => boolean;
  getRemainingUsage: (resource: keyof typeof FEATURE_LIMITS[SubscriptionTier]) => number;
}

/**
 * Subscription Store
 * Manages user subscription tier, status, and usage limits
 */
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: {
        tier: SubscriptionTier.FREE,
        status: 'active',
        startDate: new Date().toISOString(),
        features: [],
        limits: FEATURE_LIMITS[SubscriptionTier.FREE],
      },
      usage: {
        transactionsCount: 0,
        accountsCount: 0,
        categoriesCount: 0,
        budgetsCount: 0,
      },

      setSubscription: (subscription) =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            ...subscription,
            limits: FEATURE_LIMITS[subscription.tier || state.subscription.tier],
          },
        })),

      setUsage: (usage) =>
        set((state) => ({
          usage: { ...state.usage, ...usage },
        })),

      upgradeTier: (tier) =>
        set((state) => ({
          subscription: {
            ...state.subscription,
            tier,
            limits: FEATURE_LIMITS[tier],
            status: 'active',
          },
        })),

      isTrialActive: () => {
        const { subscription } = get();
        if (!subscription.trialEndsAt) return false;
        return new Date(subscription.trialEndsAt) > new Date();
      },

      hasReachedLimit: (resource) => {
        const { subscription, usage } = get();
        const limit = subscription.limits[resource];

        if (limit === Infinity) return false;

        const usageKey = `${resource.replace('max', '').toLowerCase()}Count` as keyof UsageStats;
        const currentUsage = usage[usageKey] || 0;

        return currentUsage >= (limit as number);
      },

      getRemainingUsage: (resource) => {
        const { subscription, usage } = get();
        const limit = subscription.limits[resource];

        if (limit === Infinity) return Infinity;

        const usageKey = `${resource.replace('max', '').toLowerCase()}Count` as keyof UsageStats;
        const currentUsage = usage[usageKey] || 0;

        return Math.max(0, (limit as number) - currentUsage);
      },
    }),
    {
      name: 'fms-subscription',
    }
  )
);
