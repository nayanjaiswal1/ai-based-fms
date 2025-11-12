import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Define supported languages
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// Define namespaces for better organization
export const namespaces = [
  'common',
  'auth',
  'dashboard',
  'transactions',
  'accounts',
  'budgets',
  'analytics',
  'settings',
  'notifications',
  'groups',
  'investments',
  'lendBorrow',
  'email',
  'import',
  'ai',
  'insights',
  'audit',
] as const;

export type Namespace = (typeof namespaces)[number];

// Initialize i18next
i18n
  // Load translation backend
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,

    // Supported languages
    supportedLngs: Object.keys(supportedLanguages),

    // Namespaces
    ns: namespaces,
    defaultNS: 'common',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Backend options for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // React specific options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'b', 'span'],
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
    },

    // Load translations lazily
    load: 'currentOnly',

    // Preload only the default language
    preload: ['en'],

    // Clean code on init
    cleanCode: true,

    // Allow empty string as fallback
    returnEmptyString: true,

    // Return object for nested keys
    returnObjects: false,

    // Join arrays
    joinArrays: false,

    // Key separator
    keySeparator: '.',

    // Namespace separator
    nsSeparator: ':',

    // Plural separator
    pluralSeparator: '_',

    // Context separator
    contextSeparator: '_',

    // Save missing translations
    saveMissing: import.meta.env.DEV,
    saveMissingTo: 'current',

    // Missing key handler
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${ns}:${key}`);
      }
    },
  });

// Update HTML lang and dir attributes when language changes
i18n.on('languageChanged', (lng: string) => {
  const language = lng as SupportedLanguage;
  document.documentElement.lang = lng;
  document.documentElement.dir = supportedLanguages[language]?.dir || 'ltr';

  // Store language preference
  localStorage.setItem('i18nextLng', lng);
});

// Set initial direction
const currentLang = i18n.language as SupportedLanguage;
if (supportedLanguages[currentLang]) {
  document.documentElement.dir = supportedLanguages[currentLang].dir;
}

export default i18n;
