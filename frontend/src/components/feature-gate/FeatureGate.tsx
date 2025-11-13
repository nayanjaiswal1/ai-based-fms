import { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  feature: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  redirectOnBlock?: boolean;
}

/**
 * FeatureGate Component
 * Conditionally renders children based on feature access
 * Shows upgrade prompt for locked features
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  redirectOnBlock = false,
}: FeatureGateProps) {
  const { hasAccess, requiredTier, reason } = useFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If redirect is enabled, handle navigation (would integrate with react-router)
  if (redirectOnBlock) {
    // Could redirect to pricing page or show modal
    // For now, just show the upgrade prompt
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        feature={feature}
        requiredTier={requiredTier}
        reason={reason}
      />
    );
  }

  return null;
}
