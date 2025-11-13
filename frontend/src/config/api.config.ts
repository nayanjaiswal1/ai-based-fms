/**
 * API Configuration
 * Centralized configuration for API endpoints and credentials
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,

  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      profile: '/auth/profile',
    },
    accounts: '/accounts',
    transactions: '/transactions',
    categories: '/categories',
    tags: '/tags',
    budgets: '/budgets',
    groups: '/groups',
    investments: '/investments',
    lendBorrow: '/lend-borrow',
    notifications: '/notifications',
    reminders: '/reminders',
    analytics: '/analytics',
    ai: {
      categorize: '/ai/categorize',
      chat: '/ai/chat',
      insights: '/ai/insights',
      parseReceipt: '/ai/parse-receipt',
    },
    import: '/import',
    email: '/email',
    chat: '/chat',
    admin: '/admin',
  },

  oauth: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback/google`,
      scope: 'openid profile email',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    },
  },

  websocket: {
    enabled: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
    reconnectDelay: 3000,
    maxRetries: 5,
  },
} as const;

export const STORAGE_KEYS = {
  accessToken: 'fms_access_token',
  refreshToken: 'fms_refresh_token',
  user: 'fms_user',
} as const;
