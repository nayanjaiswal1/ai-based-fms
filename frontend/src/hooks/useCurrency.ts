import { useMemo } from 'react';
import {
  formatCurrency,
  formatCurrencyLocale,
  getCurrencySymbol,
  type CurrencyCode,
} from '@/utils/currency';
import { usePreferencesStore } from '@/stores/preferencesStore';

/**
 * Hook to format currency values based on user preferences
 */
export function useCurrency() {
  const { preferences } = usePreferencesStore();
  const currency = (preferences.currency as CurrencyCode) || 'INR';

  const format = useMemo(
    () => (amount: number, customCurrency?: CurrencyCode, options?: any) => {
      return formatCurrency(amount, customCurrency || currency, options);
    },
    [currency]
  );

  const formatLocale = useMemo(
    () => (amount: number, customCurrency?: CurrencyCode, options?: any) => {
      return formatCurrencyLocale(amount, customCurrency || currency, options);
    },
    [currency]
  );

  const symbol = useMemo(
    () => (customCurrency?: CurrencyCode) => {
      return getCurrencySymbol(customCurrency || currency);
    },
    [currency]
  );

  return {
    currency,
    format,
    formatLocale,
    symbol,
  };
}
