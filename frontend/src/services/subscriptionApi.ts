import api from './api';
import { SubscriptionTier } from '@/config/features.config';

export interface SubscriptionResponse {
  id: string;
  userId?: string;
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'trial' | 'cancelled' | 'trialing';
  startDate?: string;
  endDate?: string;
  trialEndsAt?: string;
  features?: string[];
  addons?: string[];
  billingCycle?: 'monthly' | 'yearly';
  amount?: number;
  currency?: string;
  price?: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  isActive?: boolean;
  limits: {
    maxTransactions: number;
    maxAccounts: number;
    maxBudgets: number;
    maxGroups: number;
    maxInvestments: number;
    maxReports: number;
    maxApiCalls: number;
    maxExports: number;
    maxImports: number;
    maxStorage: number;
    maxUsers: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UsageResponse {
  transactionsCount: number;
  accountsCount: number;
  categoriesCount: number;
  budgetsCount: number;
  lastUpdated: string;
}

export interface AddonResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

/**
 * Subscription API Service
 * Handles all subscription-related API calls
 */
export const subscriptionApi = {
  /**
   * Get current user's subscription
   */
  getCurrent: async (): Promise<SubscriptionResponse> => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  /**
   * Get subscription usage stats
   */
  getUsage: async (): Promise<UsageResponse> => {
    const response = await api.get('/subscriptions/usage');
    return response.data;
  },

  /**
   * Upgrade to a new tier
   */
  upgrade: async (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    const response = await api.post('/subscriptions/upgrade', {
      tier,
      billingCycle,
    });
    return response.data;
  },

  /**
   * Downgrade to a lower tier
   */
  downgrade: async (tier: SubscriptionTier) => {
    const response = await api.post('/subscriptions/downgrade', {
      tier,
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancel: async () => {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },

  /**
   * Reactivate cancelled subscription
   */
  reactivate: async () => {
    const response = await api.post('/subscriptions/reactivate');
    return response.data;
  },

  /**
   * Get available addons
   */
  getAddons: async (): Promise<AddonResponse[]> => {
    const response = await api.get('/subscriptions/addons');
    return response.data;
  },

  /**
   * Purchase addon
   */
  purchaseAddon: async (addonId: string) => {
    const response = await api.post(`/subscriptions/addons/${addonId}/purchase`);
    return response.data;
  },

  /**
   * Remove addon
   */
  removeAddon: async (addonId: string) => {
    const response = await api.delete(`/subscriptions/addons/${addonId}`);
    return response.data;
  },

  /**
   * Get billing history
   */
  getBillingHistory: async () => {
    const response = await api.get('/subscriptions/billing-history');
    return response.data;
  },

  /**
   * Update payment method
   */
  updatePaymentMethod: async (paymentMethodId: string) => {
    const response = await api.post('/subscriptions/payment-method', {
      paymentMethodId,
    });
    return response.data;
  },

  /**
   * Get pricing plans
   */
  getPricing: async () => {
    const response = await api.get('/subscriptions/pricing');
    return response.data;
  },

  /**
   * Start free trial
   */
  startTrial: async (tier: SubscriptionTier) => {
    const response = await api.post('/subscriptions/trial', {
      tier,
    });
    return response.data;
  },

  /**
   * Validate feature access (server-side validation)
   */
  validateFeatureAccess: async (feature: string): Promise<{ hasAccess: boolean; reason?: string }> => {
    const response = await api.get(`/subscriptions/validate/${feature}`);
    return response.data;
  },
};
