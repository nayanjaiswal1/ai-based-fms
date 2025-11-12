import { useState, useEffect } from 'react';

/**
 * Custom hook for media query matching
 * @param query - The media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Breakpoint hooks for common screen sizes
 * These match Tailwind's default breakpoints
 */

// Mobile: < 640px
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

// Tablet: >= 640px and < 1024px
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

// Desktop: >= 1024px
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

// Small mobile: < 375px
export function useIsSmallMobile(): boolean {
  return useMediaQuery('(max-width: 374px)');
}

// Large mobile/small tablet: >= 640px
export function useIsLargeMobile(): boolean {
  return useMediaQuery('(min-width: 640px)');
}

// Medium screens: >= 768px
export function useIsMedium(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

// Large screens: >= 1024px
export function useIsLarge(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

// Extra large screens: >= 1280px
export function useIsExtraLarge(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

// Touch device detection
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    }
  }, []);

  return isTouch;
}

/**
 * Get current breakpoint name
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}
