import i18n from '@/i18n/config';
import { SupportedLanguage, supportedLanguages } from '@/i18n/config';
import { getTextDirection } from './formatting';

/**
 * Change the application language
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language);

  // Update HTML attributes
  document.documentElement.lang = language;
  document.documentElement.dir = supportedLanguages[language].dir;

  // Save preference to localStorage
  localStorage.setItem('i18nextLng', language);

  // Dispatch event for components that need to react to language change
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language || 'en') as SupportedLanguage;
}

/**
 * Get the current text direction
 */
export function getCurrentDirection(): 'ltr' | 'rtl' {
  return getTextDirection(getCurrentLanguage());
}

/**
 * Check if current language is RTL
 */
export function isCurrentLanguageRTL(): boolean {
  return getCurrentDirection() === 'rtl';
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return supportedLanguages;
}

/**
 * Get language name in native script
 */
export function getLanguageName(language: SupportedLanguage): string {
  return supportedLanguages[language]?.nativeName || language;
}

/**
 * Get language name in English
 */
export function getLanguageNameInEnglish(language: SupportedLanguage): string {
  return supportedLanguages[language]?.name || language;
}

/**
 * Load a namespace dynamically
 */
export async function loadNamespace(namespace: string): Promise<void> {
  await i18n.loadNamespaces(namespace);
}

/**
 * Check if a namespace is loaded
 */
export function isNamespaceLoaded(namespace: string): boolean {
  return i18n.hasLoadedNamespace(namespace);
}

/**
 * Get translation key with fallback
 */
export function getTranslation(key: string, defaultValue?: string): string {
  return i18n.exists(key) ? i18n.t(key) : defaultValue || key;
}

/**
 * Check if translation key exists
 */
export function translationExists(key: string): boolean {
  return i18n.exists(key);
}

/**
 * Get translations for a namespace
 */
export function getNamespaceTranslations(namespace: string): Record<string, any> {
  return i18n.getResourceBundle(getCurrentLanguage(), namespace) || {};
}

/**
 * Pluralization helper
 */
export function pluralize(
  key: string,
  count: number,
  options?: Record<string, any>
): string {
  return i18n.t(key, { count, ...options });
}

/**
 * Interpolation helper
 */
export function interpolate(
  key: string,
  values: Record<string, any>
): string {
  return i18n.t(key, values);
}

/**
 * Format translation key
 */
export function formatKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

/**
 * Get user's preferred language from browser
 */
export function getBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0];
  return (Object.keys(supportedLanguages).includes(browserLang)
    ? browserLang
    : 'en') as SupportedLanguage;
}

/**
 * Get user's language preference from localStorage or browser
 */
export function getUserLanguagePreference(): SupportedLanguage {
  const storedLang = localStorage.getItem('i18nextLng');
  if (storedLang && Object.keys(supportedLanguages).includes(storedLang)) {
    return storedLang as SupportedLanguage;
  }
  return getBrowserLanguage();
}

/**
 * Initialize i18n with user's preference
 */
export async function initializeI18n(): Promise<void> {
  const userLang = getUserLanguagePreference();
  await changeLanguage(userLang);
}

/**
 * Get localized error message
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return i18n.t('common:messages.error');
}

/**
 * Date locale mapping for date-fns
 */
export function getDateFnsLocale(language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    es: 'es',
    fr: 'fr',
    de: 'de',
    ja: 'ja',
    ar: 'ar',
  };
  return localeMap[language] || 'en-US';
}

/**
 * Number locale mapping
 */
export function getNumberLocale(language: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    ar: 'ar-SA',
  };
  return localeMap[language] || 'en-US';
}

/**
 * Get locale for formatting APIs
 */
export function getFormatLocale(language?: SupportedLanguage): string {
  return getNumberLocale(language || getCurrentLanguage());
}

export default {
  changeLanguage,
  getCurrentLanguage,
  getCurrentDirection,
  isCurrentLanguageRTL,
  getSupportedLanguages,
  getLanguageName,
  getLanguageNameInEnglish,
  loadNamespace,
  isNamespaceLoaded,
  getTranslation,
  translationExists,
  getNamespaceTranslations,
  pluralize,
  interpolate,
  formatKey,
  getBrowserLanguage,
  getUserLanguagePreference,
  initializeI18n,
  getErrorMessage,
  getDateFnsLocale,
  getNumberLocale,
  getFormatLocale,
};
