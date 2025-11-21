/**
 * Feature Flags Configuration
 * Centralized feature management with subscription tiers and toggles
 */

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum FeatureFlag {
  // Core Features (Free tier)
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  ACCOUNTS = 'accounts',
  CATEGORIES = 'categories',
  TAGS = 'tags',

  // Basic Features
  BUDGETS = 'budgets',
  BASIC_REPORTS = 'basic_reports',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings',

  // Premium Features
  GROUPS = 'groups',
  INVESTMENTS = 'investments',
  LEND_BORROW = 'lend_borrow',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  INSIGHTS = 'insights',
  RECONCILIATION = 'reconciliation',
  REMINDERS = 'reminders',

  // Enterprise Features
  AI_ASSISTANT = 'ai_assistant',
  EMAIL_INTEGRATION = 'email_integration',
  ADVANCED_IMPORT = 'advanced_import',
  ACTIVITY_LOG = 'activity_log',
  OAUTH_CONNECTIONS = 'oauth_connections',
  ADMIN_PANEL = 'admin_panel',
  API_ACCESS = 'api_access',
  CUSTOM_CATEGORIES = 'custom_categories',

  // Feature Toggles (Environment-based)
  BETA_FEATURES = 'beta_features',
  DARK_MODE = 'dark_mode',
  EXPORT_DATA = 'export_data',
}

/**
 * Feature limits per subscription tier
 */
export const FEATURE_LIMITS = {
  [SubscriptionTier.FREE]: {
    maxTransactions: 100,
    maxAccounts: 2,
    maxCategories: 10,
    maxBudgets: 2,
    dataRetentionDays: 30,
    exportFormats: [],
  },
  [SubscriptionTier.BASIC]: {
    maxTransactions: 1000,
    maxAccounts: 5,
    maxCategories: 50,
    maxBudgets: 5,
    dataRetentionDays: 180,
    exportFormats: ['csv'],
  },
  [SubscriptionTier.PREMIUM]: {
    maxTransactions: 10000,
    maxAccounts: 20,
    maxCategories: 200,
    maxBudgets: 20,
    dataRetentionDays: 365 * 2,
    exportFormats: ['csv', 'xlsx', 'pdf'],
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxTransactions: Infinity,
    maxAccounts: Infinity,
    maxCategories: Infinity,
    maxBudgets: Infinity,
    dataRetentionDays: Infinity,
    exportFormats: ['csv', 'xlsx', 'pdf', 'json', 'xml'],
  },
};

/**
 * Feature access matrix - which features are available in each tier
 */
export const FEATURE_ACCESS: Record<FeatureFlag, SubscriptionTier[]> = {
  // Free tier features
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
  [FeatureFlag.CATEGORIES]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.TAGS]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],

  // Basic tier features
  [FeatureFlag.BUDGETS]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.BASIC_REPORTS]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.NOTIFICATIONS]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.SETTINGS]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],

  // Premium tier features
  [FeatureFlag.GROUPS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.INVESTMENTS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.LEND_BORROW]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.ADVANCED_ANALYTICS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.INSIGHTS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.RECONCILIATION]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
  [FeatureFlag.REMINDERS]: [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],

  // Enterprise tier features
  [FeatureFlag.AI_ASSISTANT]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.EMAIL_INTEGRATION]: [SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE], // Made available for all tiers for testing
  [FeatureFlag.ADVANCED_IMPORT]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.ACTIVITY_LOG]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.OAUTH_CONNECTIONS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.ADMIN_PANEL]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.API_ACCESS]: [SubscriptionTier.ENTERPRISE],
  [FeatureFlag.CUSTOM_CATEGORIES]: [SubscriptionTier.ENTERPRISE],

  // Feature toggles (available to all)
  [FeatureFlag.BETA_FEATURES]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.DARK_MODE]: [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
  [FeatureFlag.EXPORT_DATA]: [
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.ENTERPRISE,
  ],
};

/**
 * Environment-based feature toggles
 */
export const ENVIRONMENT_FLAGS = {
  enableBetaFeatures: process.env.NODE_ENV === 'development',
  enableDebugMode: process.env.NODE_ENV === 'development',
  enableAnalytics: process.env.NODE_ENV === 'production',
};

/**
 * Tier pricing and features (for UI display)
 */
export const TIER_INFO = {
  [SubscriptionTier.FREE]: {
    name: 'Free',
    price: 0,
    billingCycle: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 100 transactions',
      '2 accounts',
      'Basic transaction tracking',
      'Basic categories & tags',
      '30 days data retention',
    ],
    popular: false,
  },
  [SubscriptionTier.BASIC]: {
    name: 'Basic',
    price: 9.99,
    billingCycle: 'month',
    description: 'For personal finance management',
    features: [
      'Up to 1,000 transactions',
      '5 accounts',
      'Budgets & goals',
      'Basic reports',
      'Notifications',
      'CSV export',
      '6 months data retention',
    ],
    popular: true,
  },
  [SubscriptionTier.PREMIUM]: {
    name: 'Premium',
    price: 29.99,
    billingCycle: 'month',
    description: 'For advanced users',
    features: [
      'Up to 10,000 transactions',
      '20 accounts',
      'Investment tracking',
      'Group expenses',
      'Advanced analytics & insights',
      'Reconciliation tools',
      'Multiple export formats',
      '2 years data retention',
    ],
    popular: false,
  },
  [SubscriptionTier.ENTERPRISE]: {
    name: 'Enterprise',
    price: 99.99,
    billingCycle: 'month',
    description: 'For businesses',
    features: [
      'Unlimited transactions',
      'Unlimited accounts',
      'AI-powered insights',
      'Email integration',
      'Admin panel',
      'API access',
      'OAuth connections',
      'Priority support',
      'Unlimited data retention',
    ],
    popular: false,
  },
};

/**
 * Get required tier for a feature
 */
export function getRequiredTier(feature: FeatureFlag): SubscriptionTier {
  const tiers = FEATURE_ACCESS[feature];
  return tiers[0]; // Return minimum required tier
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  return TIER_INFO[tier].name;
}
