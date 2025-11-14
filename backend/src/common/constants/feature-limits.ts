export enum Feature {
  // Transaction features
  UNLIMITED_TRANSACTIONS = 'unlimited_transactions',
  BULK_IMPORT = 'bulk_import',
  ADVANCED_SEARCH = 'advanced_search',
  EXPORT_DATA = 'export_data',

  // Group features
  UNLIMITED_GROUPS = 'unlimited_groups',
  GROUP_ANALYTICS = 'group_analytics',
  RECURRING_TRANSACTIONS = 'recurring_transactions',
  GROUP_BUDGETS = 'group_budgets',

  // AI features
  AI_CATEGORIZATION = 'ai_categorization',
  AI_INSIGHTS = 'ai_insights',
  PREDICTIVE_ANALYTICS = 'predictive_analytics',

  // Reporting features
  ADVANCED_REPORTS = 'advanced_reports',
  CUSTOM_DASHBOARDS = 'custom_dashboards',
  SCHEDULED_REPORTS = 'scheduled_reports',

  // Account features
  UNLIMITED_ACCOUNTS = 'unlimited_accounts',
  INVESTMENT_TRACKING = 'investment_tracking',
  MULTI_CURRENCY = 'multi_currency',

  // Collaboration
  REAL_TIME_COLLABORATION = 'real_time_collaboration',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  PRIORITY_SUPPORT = 'priority_support',
}

export interface FeatureLimits {
  maxTransactions: number | null; // null means unlimited
  maxAccounts: number | null;
  maxGroups: number | null;
  maxBudgets: number | null;
  maxCustomCategories: number | null;
  enabledFeatures: Feature[];
}

export const TIER_LIMITS: Record<string, FeatureLimits> = {
  FREE: {
    maxTransactions: 100,
    maxAccounts: 2,
    maxGroups: 1,
    maxBudgets: 5,
    maxCustomCategories: 10,
    enabledFeatures: [Feature.EXPORT_DATA, Feature.EMAIL_NOTIFICATIONS],
  },

  PRO: {
    maxTransactions: 1000,
    maxAccounts: 10,
    maxGroups: 5,
    maxBudgets: 20,
    maxCustomCategories: 50,
    enabledFeatures: [
      Feature.BULK_IMPORT,
      Feature.ADVANCED_SEARCH,
      Feature.EXPORT_DATA,
      Feature.GROUP_ANALYTICS,
      Feature.RECURRING_TRANSACTIONS,
      Feature.GROUP_BUDGETS,
      Feature.AI_CATEGORIZATION,
      Feature.ADVANCED_REPORTS,
      Feature.CUSTOM_DASHBOARDS,
      Feature.INVESTMENT_TRACKING,
      Feature.MULTI_CURRENCY,
      Feature.REAL_TIME_COLLABORATION,
      Feature.EMAIL_NOTIFICATIONS,
    ],
  },

  ENTERPRISE: {
    maxTransactions: null,
    maxAccounts: null,
    maxGroups: null,
    maxBudgets: null,
    maxCustomCategories: null,
    enabledFeatures: Object.values(Feature),
  },
};

export function getFeatureLimits(tier: string): FeatureLimits {
  return TIER_LIMITS[tier] || TIER_LIMITS.FREE;
}

export function isFeatureEnabled(tier: string, feature: Feature): boolean {
  const limits = getFeatureLimits(tier);
  return limits.enabledFeatures.includes(feature);
}

export function canExceedLimit(
  tier: string,
  limitType: keyof FeatureLimits,
  currentCount: number,
): boolean {
  const limits = getFeatureLimits(tier);
  const limit = limits[limitType];

  if (limit === null || typeof limit === 'object') return true; // null means unlimited, or it's the enabledFeatures array

  return currentCount < limit;
}
