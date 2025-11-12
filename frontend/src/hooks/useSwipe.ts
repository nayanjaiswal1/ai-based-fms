import { useRef, useEffect, TouchEvent } from 'react';

export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minSwipeDistance?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

/**
 * Custom hook for detecting swipe gestures on touch devices
 * @param config - Configuration object with swipe callbacks
 * @returns ref to attach to the element you want to detect swipes on
 */
export function useSwipe<T extends HTMLElement = HTMLDivElement>(
  config: SwipeConfig
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    preventDefaultTouchmoveEvent = false,
  } = config;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);
  const elementRef = useRef<T>(null);

  const handleTouchStart = (e: TouchEvent<T>) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchMove = (e: TouchEvent<T>) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;

    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

    // Determine if horizontal or vertical swipe
    const isHorizontalSwipe = absDistanceX > absDistanceY;

    if (isHorizontalSwipe) {
      // Horizontal swipe
      if (absDistanceX >= minSwipeDistance) {
        if (distanceX > 0) {
          // Swiped left
          onSwipeLeft?.();
        } else {
          // Swiped right
          onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (absDistanceY >= minSwipeDistance) {
        if (distanceY > 0) {
          // Swiped up
          onSwipeUp?.();
        } else {
          // Swiped down
          onSwipeDown?.();
        }
      }
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // We need to add these as native event listeners to use passive: false
    const touchStartHandler = (e: globalThis.TouchEvent) => {
      touchEnd.current = null;
      touchStart.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const touchMoveHandler = (e: globalThis.TouchEvent) => {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
      touchEnd.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const touchEndHandler = () => {
      if (!touchStart.current || !touchEnd.current) return;

      const distanceX = touchStart.current.x - touchEnd.current.x;
      const distanceY = touchStart.current.y - touchEnd.current.y;

      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);

      const isHorizontalSwipe = absDistanceX > absDistanceY;

      if (isHorizontalSwipe) {
        if (absDistanceX >= minSwipeDistance) {
          if (distanceX > 0) {
            onSwipeLeft?.();
          } else {
            onSwipeRight?.();
          }
        }
      } else {
        if (absDistanceY >= minSwipeDistance) {
          if (distanceY > 0) {
            onSwipeUp?.();
          } else {
            onSwipeDown?.();
          }
        }
      }
    };

    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchmove', touchMoveHandler, {
      passive: !preventDefaultTouchmoveEvent,
    });
    element.addEventListener('touchend', touchEndHandler, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance,
    preventDefaultTouchmoveEvent,
  ]);

  return {
    ref: elementRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Simplified hook that only returns handlers (no ref)
 * Useful when you need to attach handlers manually
 */
export function useSwipeHandlers(config: SwipeConfig) {
  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
  } = config;

  const handleTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;

    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

    const isHorizontalSwipe = absDistanceX > absDistanceY;

    if (isHorizontalSwipe) {
      if (absDistanceX >= minSwipeDistance) {
        if (distanceX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    } else {
      if (absDistanceY >= minSwipeDistance) {
        if (distanceY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
