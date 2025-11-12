import { ReactNode, useEffect, useState } from 'react';
import { ARIA_LIVE } from '@/config/accessibility';

type PolitenessLevel = 'polite' | 'assertive' | 'off';
type Role = 'status' | 'alert' | 'log' | 'timer';

interface LiveRegionProps {
  /**
   * Content to announce to screen readers
   */
  children?: ReactNode;
  /**
   * Message to announce (alternative to children)
   */
  message?: string;
  /**
   * Politeness level for announcements
   * - 'polite': Waits for user to finish current activity
   * - 'assertive': Interrupts current activity
   * - 'off': No announcement
   */
  politeness?: PolitenessLevel;
  /**
   * ARIA role for the live region
   */
  role?: Role;
  /**
   * Whether the entire region should be announced
   */
  atomic?: boolean;
  /**
   * Which parts of the region to announce
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  /**
   * Whether the region is visible or screen-reader only
   */
  visible?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Clear message after timeout (ms)
   */
  clearAfter?: number;
}

/**
 * LiveRegion component
 * ARIA live region for announcing dynamic content to screen readers
 * Implements WCAG 2.1 AA Success Criterion 4.1.3 (Status Messages)
 */
export function LiveRegion({
  children,
  message,
  politeness = ARIA_LIVE.POLITE,
  role = 'status',
  atomic = true,
  relevant = 'additions',
  visible = false,
  className = '',
  clearAfter,
}: LiveRegionProps) {
  const [content, setContent] = useState<ReactNode>(children || message);

  useEffect(() => {
    setContent(children || message);

    if (clearAfter && (children || message)) {
      const timeout = setTimeout(() => {
        setContent('');
      }, clearAfter);

      return () => clearTimeout(timeout);
    }
  }, [children, message, clearAfter]);

  const baseClasses = visible ? '' : 'sr-only';

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`${baseClasses} ${className}`}
    >
      {content}
    </div>
  );
}

/**
 * AlertRegion component
 * Assertive live region for important announcements
 */
interface AlertRegionProps {
  children?: ReactNode;
  message?: string;
  visible?: boolean;
  className?: string;
  clearAfter?: number;
}

export function AlertRegion({
  children,
  message,
  visible = false,
  className = '',
  clearAfter = 5000,
}: AlertRegionProps) {
  return (
    <LiveRegion
      message={message}
      politeness="assertive"
      role="alert"
      visible={visible}
      className={className}
      clearAfter={clearAfter}
    >
      {children}
    </LiveRegion>
  );
}

/**
 * StatusRegion component
 * Polite live region for status updates
 */
interface StatusRegionProps {
  children?: ReactNode;
  message?: string;
  visible?: boolean;
  className?: string;
  clearAfter?: number;
}

export function StatusRegion({
  children,
  message,
  visible = false,
  className = '',
  clearAfter = 3000,
}: StatusRegionProps) {
  return (
    <LiveRegion
      message={message}
      politeness="polite"
      role="status"
      visible={visible}
      className={className}
      clearAfter={clearAfter}
    >
      {children}
    </LiveRegion>
  );
}
