import { useEffect, useRef } from 'react';
import { getFocusableElements, FocusManager } from '@/utils/accessibility';

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   */
  isActive: boolean;
  /**
   * Whether to auto-focus the first focusable element
   */
  autoFocus?: boolean;
  /**
   * Whether to restore focus to the previously focused element when deactivated
   */
  restoreFocus?: boolean;
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
 * Hook to trap focus within a container (for modals, dialogs, etc.)
 * Implements WCAG 2.1 AA compliance for focus management
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  isActive,
  autoFocus = true,
  restoreFocus = true,
  onActivate,
  onDeactivate,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const focusManager = useRef(new FocusManager());

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Save current focus
    if (restoreFocus) {
      focusManager.current.saveFocus();
    }

    // Auto-focus first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        // Small delay to ensure proper focus
        setTimeout(() => {
          focusableElements[0].focus();
        }, 0);
      }
    }

    // Call activation callback
    onActivate?.();

    // Handle Tab key to trap focus
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab (backwards)
      if (event.shiftKey) {
        if (activeElement === firstElement || !container.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forwards)
        if (activeElement === lastElement || !container.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus when deactivated
      if (restoreFocus) {
        focusManager.current.restoreFocus();
      }

      // Call deactivation callback
      onDeactivate?.();
    };
  }, [isActive, autoFocus, restoreFocus, onActivate, onDeactivate]);

  return containerRef;
}
