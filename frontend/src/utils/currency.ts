/**
 * Currency utility functions
 */

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
};

// Default currency - can be changed based on user preference
let defaultCurrency: CurrencyCode = 'INR';

/**
 * Set the default currency for the application
 */
export function setDefaultCurrency(currency: CurrencyCode): void {
  defaultCurrency = currency;
}

/**
 * Get the default currency
 */
export function getDefaultCurrency(): CurrencyCode {
  return defaultCurrency;
}

/**
 * Get currency configuration
 */
export function getCurrencyConfig(currency?: CurrencyCode): CurrencyConfig {
  return CURRENCY_CONFIGS[currency || defaultCurrency];
}

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currency - Optional currency code (defaults to user's preferred currency)
 * @param options - Formatting options
 */
export function formatCurrency(
  amount: number,
  currency?: CurrencyCode,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
  } = options;

  const config = getCurrencyConfig(currency);
  const formattedAmount = amount.toFixed(decimals);

  if (showSymbol && showCode) {
    return `${config.symbol}${formattedAmount} ${config.code}`;
  } else if (showSymbol) {
    return `${config.symbol}${formattedAmount}`;
  } else if (showCode) {
    return `${formattedAmount} ${config.code}`;
  } else {
    return formattedAmount;
  }
}

/**
 * Format amount using Intl.NumberFormat for proper locale formatting
 */
export function formatCurrencyLocale(
  amount: number,
  currency?: CurrencyCode,
  options: Intl.NumberFormatOptions = {}
): string {
  const config = getCurrencyConfig(currency);

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    ...options,
  }).format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency?: CurrencyCode): string {
  return getCurrencyConfig(currency).symbol;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
