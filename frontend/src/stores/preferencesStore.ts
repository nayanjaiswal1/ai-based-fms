import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan' },
  CHF: { code: 'CHF', symbol: 'Fr', locale: 'de-CH', name: 'Swiss Franc' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
  AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham' },
  SAR: { code: 'SAR', symbol: '﷼', locale: 'ar-SA', name: 'Saudi Riyal' },
};

interface UserPreferences {
  currency: string;
  locale: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface PreferencesState {
  preferences: UserPreferences;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: string) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  getCurrencyInfo: () => CurrencyInfo;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  currency: 'INR', // Default to Indian Rupee
  locale: 'en-IN',
  dateFormat: 'dd/MM/yyyy',
  theme: 'light',
  language: 'en',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,

      setCurrency: (currency: string) =>
        set((state) => {
          const currencyInfo = SUPPORTED_CURRENCIES[currency];
          return {
            preferences: {
              ...state.preferences,
              currency,
              locale: currencyInfo?.locale || state.preferences.locale,
            },
          };
        }),

      setLocale: (locale: string) =>
        set((state) => ({
          preferences: { ...state.preferences, locale },
        })),

      setTheme: (theme: 'light' | 'dark' | 'auto') =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      setLanguage: (language: string) =>
        set((state) => ({
          preferences: { ...state.preferences, language },
        })),

      setPreferences: (newPreferences: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      getCurrencyInfo: (): CurrencyInfo => {
        const { preferences } = get();
        return (
          SUPPORTED_CURRENCIES[preferences.currency] ||
          SUPPORTED_CURRENCIES['INR']
        );
      },

      reset: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: 'user-preferences',
      version: 1,
    }
  )
);

// Helper function to get currency symbol
export function getCurrencySymbol(currencyCode?: string): string {
  if (currencyCode && SUPPORTED_CURRENCIES[currencyCode]) {
    return SUPPORTED_CURRENCIES[currencyCode].symbol;
  }

  // Fallback to user preference
  const preferences = usePreferencesStore.getState().preferences;
  return SUPPORTED_CURRENCIES[preferences.currency]?.symbol || '₹';
}

// Helper function to format currency with user preference
export function formatCurrencyWithPreference(
  amount: number,
  currencyCode?: string
): string {
  const preferences = usePreferencesStore.getState().preferences;
  const currency = currencyCode || preferences.currency;
  const locale = SUPPORTED_CURRENCIES[currency]?.locale || preferences.locale;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
