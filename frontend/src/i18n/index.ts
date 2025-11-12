/**
 * i18n exports for easy importing
 */

export { default as i18n } from './config';
export { supportedLanguages, namespaces } from './config';
export type { SupportedLanguage, Namespace } from './config';

// Re-export from react-i18next
export { useTranslation, Trans, Translation } from 'react-i18next';

// Re-export utilities
export * from '@/utils/i18n';
export * from '@/utils/formatting';

// Re-export hooks
export { useLocale } from '@/hooks/useLocale';

// Re-export components
export { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
