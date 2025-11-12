/**
 * Locale-aware formatting utilities using the Intl API
 */

/**
 * Format a number according to locale
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format currency according to locale and currency code
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(amount);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format time according to locale
 */
export function formatTime(
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US',
  baseDate: Date = new Date()
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diffMs = dateObj.getTime() - baseDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffYears) >= 1) {
    return rtf.format(diffYears, 'year');
  } else if (Math.abs(diffMonths) >= 1) {
    return rtf.format(diffMonths, 'month');
  } else if (Math.abs(diffWeeks) >= 1) {
    return rtf.format(diffWeeks, 'week');
  } else if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute');
  } else {
    return rtf.format(diffSeconds, 'second');
  }
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value / 100);
}

/**
 * Format compact number (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    ...options,
  }).format(value);
}

/**
 * Parse localized number string to number
 */
export function parseLocalizedNumber(
  value: string,
  locale: string = 'en-US'
): number {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  const decimalSeparator = parts.find(part => part.type === 'decimal')?.value || '.';
  const groupSeparator = parts.find(part => part.type === 'group')?.value || ',';

  const normalizedValue = value
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`), '.');

  return parseFloat(normalizedValue);
}

/**
 * Get date format pattern for locale
 */
export function getDateFormatPattern(locale: string = 'en-US'): string {
  const formatObj = new Intl.DateTimeFormat(locale);
  const parts = formatObj.formatToParts(new Date('2023-12-31'));

  return parts
    .map(part => {
      switch (part.type) {
        case 'day':
          return 'DD';
        case 'month':
          return 'MM';
        case 'year':
          return 'YYYY';
        case 'literal':
          return part.value;
        default:
          return '';
      }
    })
    .join('');
}

/**
 * Format list according to locale
 */
export function formatList(
  items: string[],
  locale: string = 'en-US',
  options?: Intl.ListFormatOptions
): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
    ...options,
  }).format(items);
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim();
}

/**
 * Check if locale uses RTL text direction
 */
export function isRTL(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const languageCode = locale.split('-')[0];
  return rtlLocales.includes(languageCode);
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
