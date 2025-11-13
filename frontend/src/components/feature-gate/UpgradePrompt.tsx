import { Lock, Crown, Zap, TrendingUp } from 'lucide-react';
import { SubscriptionTier, FeatureFlag, TIER_INFO, getTierDisplayName } from '@/config/features.config';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  feature?: FeatureFlag;
  requiredTier?: SubscriptionTier;
  reason?: string;
  variant?: 'card' | 'inline' | 'modal';
  onUpgradeClick?: () => void;
}

const TIER_ICONS = {
  [SubscriptionTier.FREE]: Lock,
  [SubscriptionTier.BASIC]: Zap,
  [SubscriptionTier.PREMIUM]: Crown,
  [SubscriptionTier.ENTERPRISE]: TrendingUp,
};

const TIER_COLORS = {
  [SubscriptionTier.FREE]: 'text-gray-600 bg-gray-100',
  [SubscriptionTier.BASIC]: 'text-blue-600 bg-blue-100',
  [SubscriptionTier.PREMIUM]: 'text-purple-600 bg-purple-100',
  [SubscriptionTier.ENTERPRISE]: 'text-orange-600 bg-orange-100',
};

/**
 * UpgradePrompt Component
 * Shows users they need to upgrade to access a feature
 */
export function UpgradePrompt({
  feature,
  requiredTier,
  reason,
  variant = 'card',
  onUpgradeClick,
}: UpgradePromptProps) {
  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default behavior - navigate to pricing page
      window.location.href = '/pricing';
    }
  };

  if (!requiredTier) {
    return null;
  }

  const TierIcon = TIER_ICONS[requiredTier];
  const tierInfo = TIER_INFO[requiredTier];
  const colorClass = TIER_COLORS[requiredTier];

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 py-1 px-2 rounded-md bg-muted/50">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {getTierDisplayName(requiredTier)} required
        </span>
        <Button size="sm" variant="link" onClick={handleUpgrade} className="h-auto p-0 text-primary">
          Upgrade
        </Button>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className={`rounded-full p-4 mb-4 ${colorClass}`}>
          <TierIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Upgrade to {tierInfo.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {reason || `This feature is only available in the ${tierInfo.name} plan and above.`}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button onClick={handleUpgrade}>
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${colorClass}`}>
          <TierIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            {getTierDisplayName(requiredTier)} Feature
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {reason || `This feature is only available in the ${tierInfo.name} plan.`}
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={handleUpgrade} size="sm">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to {tierInfo.name}
            </Button>
            <span className="text-sm text-muted-foreground">
              Starting at ${tierInfo.price}/{tierInfo.billingCycle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
