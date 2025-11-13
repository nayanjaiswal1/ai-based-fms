import { useSubscriptionStatus } from '@/hooks/useFeatureAccess';
import { SubscriptionTier } from '@/config/features.config';
import { useNavigate } from 'react-router-dom';
import { Crown, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionStatusProps {
  variant?: 'compact' | 'detailed';
  showUpgrade?: boolean;
}

const TIER_CONFIG = {
  [SubscriptionTier.FREE]: {
    label: 'Free',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: null,
  },
  [SubscriptionTier.BASIC]: {
    label: 'Basic',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    icon: TrendingUp,
  },
  [SubscriptionTier.PREMIUM]: {
    label: 'Premium',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    icon: Crown,
  },
  [SubscriptionTier.ENTERPRISE]: {
    label: 'Enterprise',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    icon: Crown,
  },
};

/**
 * Display subscription tier and usage information
 */
export function SubscriptionStatus({ variant = 'compact', showUpgrade = true }: SubscriptionStatusProps) {
  const { tier, isActive, usage, limits } = useSubscriptionStatus();
  const navigate = useNavigate();
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  // Calculate usage percentages
  const transactionUsage = limits.maxTransactions === Infinity
    ? 0
    : (usage.transactionsCount / limits.maxTransactions) * 100;

  const accountUsage = limits.maxAccounts === Infinity
    ? 0
    : (usage.accountsCount / limits.maxAccounts) * 100;

  // Determine if any usage is high (>80%)
  const hasHighUsage = transactionUsage > 80 || accountUsage > 80;
  const hasWarning = !isActive || hasHighUsage;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:opacity-80',
          config.bgColor,
          config.color
        )}
        onClick={() => navigate('/settings/subscription')}
        title="View subscription details"
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{config.label}</span>
        {hasWarning && (
          <AlertCircle className="h-3 w-3 text-orange-500" />
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border p-4 space-y-3', config.bgColor)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn('h-5 w-5', config.color)} />}
          <h3 className={cn('font-semibold', config.color)}>{config.label} Plan</h3>
        </div>
        {showUpgrade && tier !== SubscriptionTier.ENTERPRISE && (
          <button
            onClick={() => navigate('/settings/subscription')}
            className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>

      {/* Status */}
      {!isActive && (
        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
          <AlertCircle className="h-4 w-4" />
          <span>Subscription inactive or expired</span>
        </div>
      )}

      {/* Usage Stats */}
      {isActive && (
        <div className="space-y-2">
          {/* Transactions */}
          {limits.maxTransactions !== Infinity && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Transactions</span>
                <span className={cn(
                  'font-medium',
                  transactionUsage > 90 ? 'text-red-600' : transactionUsage > 80 ? 'text-orange-600' : 'text-muted-foreground'
                )}>
                  {usage.transactionsCount} / {limits.maxTransactions}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    transactionUsage > 90 ? 'bg-red-500' : transactionUsage > 80 ? 'bg-orange-500' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(transactionUsage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Accounts */}
          {limits.maxAccounts !== Infinity && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Accounts</span>
                <span className={cn(
                  'font-medium',
                  accountUsage > 90 ? 'text-red-600' : accountUsage > 80 ? 'text-orange-600' : 'text-muted-foreground'
                )}>
                  {usage.accountsCount} / {limits.maxAccounts}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    accountUsage > 90 ? 'bg-red-500' : accountUsage > 80 ? 'bg-orange-500' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(accountUsage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlimited indicator */}
          {limits.maxTransactions === Infinity && (
            <div className="text-xs text-muted-foreground">
              Unlimited usage
            </div>
          )}
        </div>
      )}
    </div>
  );
}
