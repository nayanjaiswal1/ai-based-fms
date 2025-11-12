import { useCallback, useRef } from 'react';
import { ARIA_LIVE, ANNOUNCEMENT_TIMEOUT } from '@/config/accessibility';

type PolitenessLevel = 'polite' | 'assertive' | 'off';

interface AnnouncementOptions {
  /**
   * Politeness level for the announcement
   * - 'polite': Waits for user to finish current activity
   * - 'assertive': Interrupts current activity
   * - 'off': No announcement
   */
  politeness?: PolitenessLevel;
  /**
   * Timeout before removing the announcement (ms)
   */
  timeout?: number;
  /**
   * Whether to clear previous announcements
   */
  clearPrevious?: boolean;
}

/**
 * Hook for making screen reader announcements
 * Implements WCAG 2.1 AA compliance for dynamic content updates
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Ensure the announcer element exists in the DOM
   */
  const ensureAnnouncer = useCallback(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', ARIA_LIVE.POLITE);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }
    return announcerRef.current;
  }, []);

  /**
   * Announce a message to screen readers
   */
  const announce = useCallback(
    (
      message: string,
      options: AnnouncementOptions = {}
    ) => {
      const {
        politeness = 'polite',
        timeout = ANNOUNCEMENT_TIMEOUT.MEDIUM,
        clearPrevious = true,
      } = options;

      const announcer = ensureAnnouncer();

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Clear previous message if requested
      if (clearPrevious) {
        announcer.textContent = '';
      }

      // Update politeness level
      announcer.setAttribute('aria-live', politeness);

      // Small delay to ensure screen readers pick up the change
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);

      // Clear message after timeout
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          announcer.textContent = '';
        }, timeout);
      }
    },
    [ensureAnnouncer]
  );

  /**
   * Announce a loading state
   */
  const announceLoading = useCallback(
    (message = 'Loading, please wait') => {
      announce(message, { politeness: 'polite' });
    },
    [announce]
  );

  /**
   * Announce success message
   */
  const announceSuccess = useCallback(
    (message: string) => {
      announce(message, { politeness: 'polite', timeout: ANNOUNCEMENT_TIMEOUT.SHORT });
    },
    [announce]
  );

  /**
   * Announce error message
   */
  const announceError = useCallback(
    (message: string) => {
      announce(message, { politeness: 'assertive', timeout: ANNOUNCEMENT_TIMEOUT.LONG });
    },
    [announce]
  );

  /**
   * Announce navigation change
   */
  const announceNavigation = useCallback(
    (pageName: string) => {
      announce(`Navigated to ${pageName}`, {
        politeness: 'polite',
        timeout: ANNOUNCEMENT_TIMEOUT.SHORT,
      });
    },
    [announce]
  );

  /**
   * Clear current announcement
   */
  const clear = useCallback(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Cleanup announcer element
   */
  const cleanup = useCallback(() => {
    if (announcerRef.current && announcerRef.current.parentNode) {
      announcerRef.current.parentNode.removeChild(announcerRef.current);
      announcerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    announce,
    announceLoading,
    announceSuccess,
    announceError,
    announceNavigation,
    clear,
    cleanup,
  };
}
