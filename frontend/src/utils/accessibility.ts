/**
 * Accessibility utility functions for WCAG 2.1 AA compliance
 */

/**
 * Generate a unique ID for accessibility purposes
 */
let idCounter = 0;
export function generateId(prefix = 'a11y'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter((element) => {
      // Check if element is visible
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    });
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.key === 'Tab') {
    // Shift + Tab (backwards)
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return focusableSelectors.some((selector) => element.matches(selector));
}

/**
 * Get the contrast ratio between two colors (for WCAG compliance)
 * @param color1 - RGB color array [r, g, b]
 * @param color2 - RGB color array [r, g, b]
 * @returns Contrast ratio
 */
export function getContrastRatio(color1: number[], color2: number[]): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance for a color
 */
function getRelativeLuminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether the text is considered large (18pt+ or 14pt+ bold)
 */
export function meetsWCAGAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): number[] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Manage focus restoration after modal close
 */
export class FocusManager {
  private previousActiveElement: HTMLElement | null = null;

  saveFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  restoreFocus(): void {
    if (this.previousActiveElement && this.previousActiveElement.focus) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }
}

/**
 * Create aria-describedby relationship
 */
export function createAriaDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter((id): id is string => Boolean(id));
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Format currency for screen readers
 */
export function formatCurrencyForScreenReader(amount: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  const formatted = formatter.format(amount);

  // Make it more natural for screen readers
  return formatted.replace('$', 'dollars ').replace('.', ' point ');
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Debounce function for keyboard shortcuts
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
