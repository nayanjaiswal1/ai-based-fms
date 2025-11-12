import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage, supportedLanguages } from '@/i18n/config';
import {
  changeLanguage,
  getCurrentLanguage,
  getCurrentDirection,
  isCurrentLanguageRTL,
  getFormatLocale,
} from '@/utils/i18n';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  formatPercentage,
  formatCompactNumber,
} from '@/utils/formatting';

/**
 * Hook for managing locale and internationalization
 */
export function useLocale() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<SupportedLanguage>(getCurrentLanguage());
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(getCurrentDirection());
  const [locale, setLocale] = useState<string>(getFormatLocale());

  // Update state when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = getCurrentLanguage();
      const newDir = getCurrentDirection();
      const newLocale = getFormatLocale(newLang);

      setLanguage(newLang);
      setDirection(newDir);
      setLocale(newLocale);
    };

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [i18n]);

  // Change language
  const setLanguagePreference = useCallback(async (newLanguage: SupportedLanguage) => {
    await changeLanguage(newLanguage);
  }, []);

  // Get language info
  const languageInfo = supportedLanguages[language];

  // Formatting functions with current locale
  const format = {
    currency: (amount: number, currency: string = 'USD', options?: Intl.NumberFormatOptions) =>
      formatCurrency(amount, currency, locale, options),

    date: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),

    time: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatTime(date, locale, options),

    dateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(date, locale, options),

    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, locale, options),

    relativeTime: (date: Date | string | number, baseDate?: Date) =>
      formatRelativeTime(date, locale, baseDate),

    percentage: (value: number, options?: Intl.NumberFormatOptions) =>
      formatPercentage(value, locale, options),

    compactNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatCompactNumber(value, locale, options),
  };

  return {
    // Current language
    language,
    setLanguage: setLanguagePreference,

    // Language info
    languageInfo,
    languageName: languageInfo.nativeName,
    languageNameEnglish: languageInfo.name,

    // Text direction
    direction,
    isRTL: direction === 'rtl',
    isLTR: direction === 'ltr',

    // Locale for formatting
    locale,

    // Formatting functions
    format,

    // Available languages
    availableLanguages: supportedLanguages,
    supportedLanguages: Object.keys(supportedLanguages) as SupportedLanguage[],

    // i18n instance
    i18n,
  };
}

export default useLocale;
