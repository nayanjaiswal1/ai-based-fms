import { SubscriptionTier } from '../../database/entities/subscription.entity';

export enum FeatureFlag {
  // Core Features
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  ACCOUNTS = 'accounts',
  BUDGETS = 'budgets',
  GROUPS = 'groups',
  INVESTMENTS = 'investments',
  LEND_BORROW = 'lend_borrow',

  // Analytics & Reports
  BASIC_REPORTS = 'basic_reports',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  INSIGHTS = 'insights',
  CUSTOM_DASHBOARDS = 'custom_dashboards',

  // Import & Export
  CSV_IMPORT = 'csv_import',
  ADVANCED_IMPORT = 'advanced_import',
  EXPORT_DATA = 'export_data',
  BULK_OPERATIONS = 'bulk_operations',

  // Integrations
  EMAIL_INTEGRATION = 'email_integration',
  API_ACCESS = 'api_access',
  WEBHOOKS = 'webhooks',
  THIRD_PARTY_INTEGRATIONS = 'third_party_integrations',

  // Advanced Features
  AI_ASSISTANT = 'ai_assistant',
  PREDICTIVE_ANALYTICS = 'predictive_analytics',
  AUTOMATED_CATEGORIZATION = 'automated_categorization',
  SMART_INSIGHTS = 'smart_insights',

  // Collaboration
  MULTI_USER = 'multi_user',
  SHARED_REPORTS = 'shared_reports',
  TEAM_PERMISSIONS = 'team_permissions',

  // Support & Services
  PRIORITY_SUPPORT = 'priority_support',
  DEDICATED_ACCOUNT_MANAGER = 'dedicated_account_manager',
  CUSTOM_ONBOARDING = 'custom_onboarding',

  // Security
  TWO_FACTOR_AUTH = '2fa',
  SSO = 'sso',
  AUDIT_LOGS = 'audit_logs',
  DATA_RETENTION_POLICIES = 'data_retention_policies',
}

/**
 * Feature access matrix - defines which subscription tiers have access to each feature
 */
export const FEATURE_ACCESS: Record<FeatureFlag, SubscriptionTier[]> = {
  // Core Features - All tiers
  [FeatureFlag.DASHBOARD]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.TRANSACTIONS]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.ACCOUNTS]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.BUDGETS]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],

  // Intermediate Features - Basic+
  [FeatureFlag.GROUPS]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.BASIC_REPORTS]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.CSV_IMPORT]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.EXPORT_DATA]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.TWO_FACTOR_AUTH]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],

  // Advanced Features - Premium+
  [FeatureFlag.INVESTMENTS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.LEND_BORROW]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.ADVANCED_ANALYTICS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.INSIGHTS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.CUSTOM_DASHBOARDS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.ADVANCED_IMPORT]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.BULK_OPERATIONS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.EMAIL_INTEGRATION]: [SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE], // Made available for all tiers for testing
  [FeatureFlag.AUTOMATED_CATEGORIZATION]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.MULTI_USER]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.SHARED_REPORTS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.AUDIT_LOGS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],

  // Enterprise-only Features
  [FeatureFlag.AI_ASSISTANT]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.PREDICTIVE_ANALYTICS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.SMART_INSIGHTS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.API_ACCESS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.WEBHOOKS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.THIRD_PARTY_INTEGRATIONS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.TEAM_PERMISSIONS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.PRIORITY_SUPPORT]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.DEDICATED_ACCOUNT_MANAGER]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.CUSTOM_ONBOARDING]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.SSO]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.DATA_RETENTION_POLICIES]: [SubscriptionTier.ENTERPRISE],
};

/**
 * Usage limits per subscription tier
 */
export interface TierLimits {
  maxTransactions: number;
  maxAccounts: number;
  maxBudgets: number;
  maxGroups: number;
  maxInvestments: number;
  maxReports: number;
  maxApiCalls: number;
  maxExports: number;
  maxImports: number;
  maxStorage: number; // in bytes
  maxUsers: number;
}

export const FEATURE_LIMITS: Record<SubscriptionTier, TierLimits> = {
  [SubscriptionTier.FREE]: {
    maxTransactions: 100,
    maxAccounts: 3,
    maxBudgets: 2,
    maxGroups: 0,
    maxInvestments: 0,
    maxReports: 2,
    maxApiCalls: 0,
    maxExports: 5,
    maxImports: 1,
    maxStorage: 10 * 1024 * 1024, // 10MB
    maxUsers: 1,
  },
  [SubscriptionTier.BASIC]: {
    maxTransactions: 1000,
    maxAccounts: 10,
    maxBudgets: 10,
    maxGroups: 5,
    maxInvestments: 0,
    maxReports: 20,
    maxApiCalls: 0,
    maxExports: 50,
    maxImports: 10,
    maxStorage: 100 * 1024 * 1024, // 100MB
    maxUsers: 1,
  },
  [SubscriptionTier.PREMIUM]: {
    maxTransactions: 10000,
    maxAccounts: 50,
    maxBudgets: Infinity,
    maxGroups: 50,
    maxInvestments: 100,
    maxReports: 200,
    maxApiCalls: 0,
    maxExports: 500,
    maxImports: 100,
    maxStorage: 1024 * 1024 * 1024, // 1GB
    maxUsers: 5,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxTransactions: Infinity,
    maxAccounts: Infinity,
    maxBudgets: Infinity,
    maxGroups: Infinity,
    maxInvestments: Infinity,
    maxReports: Infinity,
    maxApiCalls: Infinity,
    maxExports: Infinity,
    maxImports: Infinity,
    maxStorage: Infinity,
    maxUsers: Infinity,
  },
};

/**
 * Check if a user has access to a specific feature based on their subscription tier
 */
export function hasFeatureAccess(userTier: SubscriptionTier, feature: FeatureFlag): boolean {
  const allowedTiers = FEATURE_ACCESS[feature];
  return allowedTiers.includes(userTier);
}

/**
 * Get the tier limits for a specific subscription tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return FEATURE_LIMITS[tier];
}

/**
 * Get the required tier for a feature (the lowest tier that has access)
 */
export function getRequiredTier(feature: FeatureFlag): SubscriptionTier {
  const allowedTiers = FEATURE_ACCESS[feature];
  const tierOrder = [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ];

  for (const tier of tierOrder) {
    if (allowedTiers.includes(tier)) {
      return tier;
    }
  }

  return SubscriptionTier.ENTERPRISE;
}
