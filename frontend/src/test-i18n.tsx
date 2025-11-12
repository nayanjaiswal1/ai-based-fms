/**
 * Simple test component to verify i18n is working
 * Run this to test the i18n implementation
 */

import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { LanguageSwitcher } from '@/components/i18n';

export function I18nTestComponent() {
  const { t } = useTranslation(['common', 'dashboard']);
  const { format, language, direction, isRTL } = useLocale();

  return (
    <div dir={direction} className="p-8 space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-4">
          {t('common:appName')} - i18n Test
        </h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Language:</p>
            <p className="font-semibold">{language}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Text Direction:</p>
            <p className="font-semibold">{direction} {isRTL && '(RTL Mode Active)'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Navigation Translation:</p>
            <p className="font-semibold">{t('common:navigation.dashboard')}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Dashboard Translation:</p>
            <p className="font-semibold">{t('dashboard:welcome', { name: 'User' })}</p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Formatting Examples</h2>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Currency:</p>
            <p className="font-semibold">{format.currency(1234.56, 'USD')}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Date:</p>
            <p className="font-semibold">{format.date(new Date())}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Number:</p>
            <p className="font-semibold">{format.number(12345.67)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Percentage:</p>
            <p className="font-semibold">{format.percentage(85)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Compact Number:</p>
            <p className="font-semibold">{format.compactNumber(1500000)}</p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Language Switcher</h2>
        <LanguageSwitcher variant="inline" showIcon showLabel />
      </div>
    </div>
  );
}

export default I18nTestComponent;
