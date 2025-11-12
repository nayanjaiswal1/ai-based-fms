import { ReactNode } from 'react';

interface VisuallyHiddenProps {
  /**
   * Content to be hidden visually but available to screen readers
   */
  children: ReactNode;
  /**
   * HTML element to render
   */
  as?: keyof JSX.IntrinsicElements;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * VisuallyHidden component
 * Hides content visually while keeping it accessible to screen readers
 * Implements WCAG 2.1 AA technique for providing off-screen text
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  className = '',
}: VisuallyHiddenProps) {
  return (
    <Component
      className={`sr-only ${className}`}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * ShowOnFocus component
 * Content is hidden by default but becomes visible when focused
 * Useful for skip links and keyboard navigation hints
 */
interface ShowOnFocusProps {
  children: ReactNode;
  className?: string;
}

export function ShowOnFocus({ children, className = '' }: ShowOnFocusProps) {
  return (
    <div
      className={`
        sr-only
        focus-within:not-sr-only
        focus-within:absolute
        focus-within:z-50
        ${className}
      `}
    >
      {children}
    </div>
  );
}
