import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useFeatureAccess';
import { FEATURE_LIMITS, SubscriptionTier } from '@/config/features.config';
import { Button } from '@/components/ui/button';

interface UsageLimitBannerProps {
  resource: keyof typeof FEATURE_LIMITS[SubscriptionTier];
  onUpgrade?: () => void;
}

/**
 * UsageLimitBanner Component
 * Shows usage warnings when approaching limits
 */
export function UsageLimitBanner({ resource, onUpgrade }: UsageLimitBannerProps) {
  const { limits, usage, getRemainingUsage, tier } = useSubscriptionStatus();

  const limit = limits[resource];
  const remaining = getRemainingUsage(resource);

  // Don't show for unlimited resources
  if (limit === Infinity) {
    return null;
  }

  const usageKey = `${resource.replace('max', '').toLowerCase()}Count` as keyof typeof usage;
  const current = usage[usageKey] || 0;
  const percentage = (current / (limit as number)) * 100;

  // Only show when at 80% or above
  if (percentage < 80) {
    return null;
  }

  const isAtLimit = remaining === 0;
  const isNearLimit = percentage >= 90;

  return (
    <div
      className={`rounded-lg border p-4 ${
        isAtLimit
          ? 'border-destructive bg-destructive/5'
          : isNearLimit
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
          : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`h-5 w-5 mt-0.5 ${
            isAtLimit ? 'text-destructive' : isNearLimit ? 'text-orange-600' : 'text-yellow-600'
          }`}
        />
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            {isAtLimit ? 'Limit Reached' : 'Approaching Limit'}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {isAtLimit
              ? `You've reached your ${resource.replace('max', '').toLowerCase()} limit of ${limit}.`
              : `You've used ${current} of ${limit} ${resource.replace('max', '').toLowerCase()} (${percentage.toFixed(0)}%). `}
            {remaining > 0
              ? `You have ${remaining} remaining.`
              : 'Upgrade your plan to add more.'}
          </p>
          {isAtLimit && (
            <Button
              size="sm"
              onClick={onUpgrade || (() => (window.location.href = '/pricing'))}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isAtLimit && (
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isNearLimit ? 'bg-orange-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
