import { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProtectedActionProps {
  feature: FeatureFlag;
  children: ReactNode;
  /**
   * What to do when access is denied:
   * - 'disable': Disable the action (default)
   * - 'hide': Hide the action completely
   * - 'show-locked': Show the action with a lock icon and redirect to upgrade
   */
  behavior?: 'disable' | 'hide' | 'show-locked';
  /**
   * If true, shows a tooltip explaining why the action is locked
   */
  showTooltip?: boolean;
  /**
   * Custom class name to apply
   */
  className?: string;
}

/**
 * Wrapper component to protect actions (buttons, links, etc.) based on feature access
 *
 * @example
 * ```tsx
 * <ProtectedAction feature={FeatureFlag.ADVANCED_EXPORT} behavior="disable">
 *   <button onClick={handleExport}>Export to PDF</button>
 * </ProtectedAction>
 * ```
 */
export function ProtectedAction({
  feature,
  children,
  behavior = 'disable',
  showTooltip = true,
  className,
}: ProtectedActionProps) {
  const { hasAccess, requiredTier } = useFeatureAccess(feature);
  const navigate = useNavigate();

  // If user has access, render children as-is
  if (hasAccess) {
    return <>{children}</>;
  }

  // Hide completely if behavior is 'hide'
  if (behavior === 'hide') {
    return null;
  }

  // Show locked version with redirect to upgrade
  if (behavior === 'show-locked') {
    return (
      <div
        className={cn('relative group cursor-pointer', className)}
        onClick={() => navigate('/settings/subscription')}
      >
        <div className="pointer-events-none opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        {showTooltip && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 px-3 py-2 bg-popover text-popover-foreground text-xs rounded shadow-lg whitespace-nowrap">
            Requires {requiredTier} plan. Click to upgrade.
          </div>
        )}
      </div>
    );
  }

  // Default: disable the action
  // Clone the children and add disabled prop if it's a button or input element
  const disabledChildren = (
    <div className={cn('relative group', className)}>
      <div className="pointer-events-none opacity-50 cursor-not-allowed">
        {children}
      </div>
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 px-3 py-2 bg-popover text-popover-foreground text-xs rounded shadow-lg whitespace-nowrap">
          Requires {requiredTier} plan
        </div>
      )}
    </div>
  );

  return disabledChildren;
}
