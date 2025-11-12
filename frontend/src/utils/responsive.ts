/**
 * Responsive utility functions and constants
 * for mobile optimization
 */

/**
 * Tailwind breakpoints (matching default configuration)
 */
export const breakpoints = {
  xs: 320, // Small mobile (iPhone SE)
  sm: 640, // Mobile
  md: 768, // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
  '2xl': 1536, // Extra large desktop
} as const;

/**
 * Common viewport sizes for testing
 */
export const viewportSizes = {
  iphoneSE: { width: 320, height: 568 },
  iphone: { width: 375, height: 667 },
  iphonePlus: { width: 414, height: 736 },
  iphoneX: { width: 375, height: 812 },
  ipad: { width: 768, height: 1024 },
  ipadPro: { width: 1024, height: 1366 },
} as const;

/**
 * Touch target sizes (WCAG 2.5.5 - Target Size)
 * Minimum: 44x44px for touch targets
 */
export const touchTargets = {
  minimum: 44, // Minimum size in pixels
  recommended: 48, // Recommended size in pixels
  comfortable: 56, // Comfortable size in pixels
} as const;

/**
 * Check if current viewport matches a breakpoint
 */
export function isBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
}

/**
 * Check if device is mobile (< 768px)
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
}

/**
 * Check if device is tablet (>= 768px and < 1024px)
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
}

/**
 * Check if device is desktop (>= 1024px)
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
}

/**
 * Get current breakpoint name
 */
export function getCurrentBreakpoint(): keyof typeof breakpoints {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;

  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints['2xl']) return 'xl';
  return '2xl';
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

/**
 * Check if device is likely a mobile device (combines viewport and touch)
 */
export function isMobileDevice(): boolean {
  return isMobileViewport() && isTouchDevice();
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate responsive font size based on viewport
 * @param base - Base font size in pixels
 * @param scale - Scale factor for mobile (default: 0.875)
 */
export function responsiveFontSize(base: number, scale: number = 0.875): number {
  if (isMobileViewport()) {
    return base * scale;
  }
  return base;
}

/**
 * Calculate responsive spacing based on viewport
 * @param base - Base spacing in rem or pixels
 * @param mobileScale - Scale factor for mobile (default: 0.75)
 */
export function responsiveSpacing(base: number, mobileScale: number = 0.75): number {
  if (isMobileViewport()) {
    return base * mobileScale;
  }
  return base;
}

/**
 * Get optimal table/list display mode based on viewport
 */
export function getOptimalDisplayMode(): 'table' | 'cards' | 'list' {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;

  if (width < breakpoints.md) {
    return 'cards'; // Use cards on mobile
  } else if (width < breakpoints.lg) {
    return 'list'; // Use list on tablet
  }
  return 'table'; // Use table on desktop
}

/**
 * Format number with responsive decimal places
 * @param value - Number to format
 * @param maxDecimals - Maximum decimal places (default: 2)
 */
export function formatResponsiveNumber(value: number, maxDecimals: number = 2): string {
  const decimals = isMobileViewport() ? Math.min(maxDecimals, 1) : maxDecimals;
  return value.toFixed(decimals);
}

/**
 * Truncate text based on viewport size
 * @param text - Text to truncate
 * @param desktopLength - Maximum length on desktop
 * @param mobileLength - Maximum length on mobile
 */
export function truncateResponsive(
  text: string,
  desktopLength: number,
  mobileLength: number
): string {
  const maxLength = isMobileViewport() ? mobileLength : desktopLength;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get column count for responsive grid
 * @param desktop - Columns on desktop
 * @param tablet - Columns on tablet
 * @param mobile - Columns on mobile
 */
export function getResponsiveColumns(
  desktop: number,
  tablet: number = Math.ceil(desktop / 2),
  mobile: number = 1
): number {
  if (isMobileViewport()) return mobile;
  if (isTabletViewport()) return tablet;
  return desktop;
}

/**
 * Check if element should use full-screen modal on mobile
 */
export function shouldUseFullScreenModal(): boolean {
  return isMobileViewport();
}

/**
 * Get optimal chart height based on viewport
 */
export function getResponsiveChartHeight(): number {
  if (typeof window === 'undefined') return 400;

  const width = window.innerWidth;

  if (width < breakpoints.sm) return 250; // Small mobile
  if (width < breakpoints.md) return 300; // Mobile
  if (width < breakpoints.lg) return 350; // Tablet
  return 400; // Desktop
}

/**
 * Debounce function for resize events
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

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lock body scroll (useful for modals on mobile)
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
}

/**
 * Unlock body scroll
 */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Get safe area insets for notched devices (iOS)
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
}
