import { memo, CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base skeleton primitive for building custom skeletons
 * Highly optimized with CSS-only animations
 */
export const Skeleton = memo(({
  width = '100%',
  height = '1rem',
  variant = 'text',
  className = '',
  animation = 'pulse',
}: SkeletonProps) => {
  const baseClass = 'bg-gray-200';

  const variantClass = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  }[variant];

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }[animation];

  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClass} ${variantClass} ${animationClass} ${className}`.trim()}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
});

Skeleton.displayName = 'Skeleton';
