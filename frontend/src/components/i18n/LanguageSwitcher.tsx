import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { SupportedLanguage } from '@/i18n/config';
import { useLocale } from '@/hooks/useLocale';

interface LanguageSwitcherProps {
  variant?: 'select' | 'inline';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'select',
  showIcon = true,
  showLabel = true,
  className = '',
}: LanguageSwitcherProps) {
  const { language, setLanguage, availableLanguages, supportedLanguages } = useLocale();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    if (newLanguage === language) return;

    setIsChanging(true);
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`space-y-2 ${className}`}>
        {supportedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            disabled={isChanging}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              language === lang
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground'
            } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              {showIcon && <Globe className="h-4 w-4" />}
              <div className="text-left">
                <div className="font-medium">{availableLanguages[lang].nativeName}</div>
                {showLabel && (
                  <div className="text-sm opacity-75">{availableLanguages[lang].name}</div>
                )}
              </div>
            </div>
            {language === lang && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Globe className="h-4 w-4 text-muted-foreground" />}
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
        disabled={isChanging}
        className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {availableLanguages[lang].nativeName}
            {showLabel && ` (${availableLanguages[lang].name})`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSwitcher;
