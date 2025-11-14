import { useMemo } from 'react';
import {
  formatCurrency,
  formatCurrencyLocale,
  getCurrencySymbol,
  getDefaultCurrency,
  type CurrencyCode,
} from '@/utils/currency';

/**
 * Hook to format currency values
 * Can be extended later to use user's currency preference from store
 */
export function useCurrency() {
  const currency = useMemo(() => getDefaultCurrency(), []);

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
