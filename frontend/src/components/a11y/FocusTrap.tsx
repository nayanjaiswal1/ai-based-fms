import { ReactNode } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface FocusTrapProps {
  /**
   * Whether the focus trap is active
   */
  isActive: boolean;
  /**
   * Child elements to render inside the focus trap
   */
  children: ReactNode;
  /**
   * Whether to auto-focus the first focusable element
   */
  autoFocus?: boolean;
  /**
   * Whether to restore focus when trap is deactivated
   */
  restoreFocus?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when focus trap is activated
   */
  onActivate?: () => void;
  /**
   * Callback when focus trap is deactivated
   */
  onDeactivate?: () => void;
}

/**
 * FocusTrap component
 * Traps keyboard focus within a container (for modals, dialogs, etc.)
 * Implements WCAG 2.1 AA Success Criterion 2.4.3 (Focus Order)
 */
export function FocusTrap({
  isActive,
  children,
  autoFocus = true,
  restoreFocus = true,
  className = '',
  onActivate,
  onDeactivate,
}: FocusTrapProps) {
  const containerRef = useFocusTrap({
    isActive,
    autoFocus,
    restoreFocus,
    onActivate,
    onDeactivate,
  });

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
