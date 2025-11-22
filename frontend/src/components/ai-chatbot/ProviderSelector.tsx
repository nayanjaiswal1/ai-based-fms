import React from 'react';
import { useAuthStore } from '@stores/authStore';

export interface ProviderSelectorProps {
  value: string;
  onChange: (provider: string) => void;
  disabled?: boolean;
}

const PROVIDERS = {
  openai: {
    name: 'OpenAI (GPT-4 Vision)',
    description: 'Most accurate, best for complex receipts',
    tier: 'PREMIUM',
    icon: '🤖',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Fast and accurate, great value',
    tier: 'BASIC',
    icon: '✨',
  },
  ocr_space: {
    name: 'Free OCR',
    description: 'Basic text extraction, always free',
    tier: 'FREE',
    icon: '📄',
  },
};

const TIER_HIERARCHY = {
  FREE: 0,
  BASIC: 1,
  PREMIUM: 2,
};

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { user } = useAuthStore();
  const userTier = user?.subscriptionTier || 'FREE';
  const userTierLevel = TIER_HIERARCHY[userTier as keyof typeof TIER_HIERARCHY] || 0;

  const getAvailableProviders = () => {
    return Object.entries(PROVIDERS).filter(([_, provider]) => {
      const providerTierLevel =
        TIER_HIERARCHY[provider.tier as keyof typeof TIER_HIERARCHY];
      return providerTierLevel <= userTierLevel;
    });
  };

  const availableProviders = getAvailableProviders();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        AI Provider
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {availableProviders.map(([key, provider]) => (
          <option key={key} value={key}>
            {provider.icon} {provider.name} - {provider.description}
          </option>
        ))}
      </select>

      {/* Upgrade prompt for unavailable providers */}
      {userTier !== 'PREMIUM' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {userTier === 'FREE' && (
            <p>
              🔒 Upgrade to <strong>BASIC</strong> for Gemini or{' '}
              <strong>PREMIUM</strong> for OpenAI
            </p>
          )}
          {userTier === 'BASIC' && (
            <p>
              🔒 Upgrade to <strong>PREMIUM</strong> to unlock OpenAI (GPT-4 Vision)
            </p>
          )}
        </div>
      )}

      {/* Selected provider info */}
      {value && PROVIDERS[value as keyof typeof PROVIDERS] && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>
              {PROVIDERS[value as keyof typeof PROVIDERS].icon}{' '}
              {PROVIDERS[value as keyof typeof PROVIDERS].name}
            </strong>
            : {PROVIDERS[value as keyof typeof PROVIDERS].description}
          </p>
        </div>
      )}
    </div>
  );
};
