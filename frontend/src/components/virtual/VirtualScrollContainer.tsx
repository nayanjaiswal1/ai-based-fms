import React, { ReactNode, CSSProperties, forwardRef } from 'react';

export interface VirtualScrollContainerProps {
  /**
   * Children elements (virtual items)
   */
  children: ReactNode;

  /**
   * Total height/width of the virtual scroll area
   */
  totalSize: number;

  /**
   * Whether to use horizontal scrolling
   */
  horizontal?: boolean;

  /**
   * Container height (for vertical scrolling)
   */
  height?: string | number;

  /**
   * Container width (for horizontal scrolling)
   */
  width?: string | number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Additional styles
   */
  style?: CSSProperties;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Role for accessibility
   */
  role?: string;

  /**
   * Callback when container is scrolled
   */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Container component for virtual scrolling
 * Provides the scrollable area and proper styling
 */
export const VirtualScrollContainer = forwardRef<
  HTMLDivElement,
  VirtualScrollContainerProps
>(
  (
    {
      children,
      totalSize,
      horizontal = false,
      height = '100%',
      width = '100%',
      className = '',
      style = {},
      ariaLabel,
      role = 'list',
      onScroll,
    },
    ref
  ) => {
    const containerStyle: CSSProperties = {
      height: horizontal ? height : height,
      width: horizontal ? width : width,
      overflow: 'auto',
      position: 'relative',
      willChange: 'transform',
      ...style,
    };

    const innerStyle: CSSProperties = {
      height: horizontal ? '100%' : `${totalSize}px`,
      width: horizontal ? `${totalSize}px` : '100%',
      position: 'relative',
    };

    return (
      <div
        ref={ref}
        className={`virtual-scroll-container ${className}`}
        style={containerStyle}
        onScroll={onScroll}
        role={role}
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <div className="virtual-scroll-inner" style={innerStyle}>
          {children}
        </div>
      </div>
    );
  }
);

VirtualScrollContainer.displayName = 'VirtualScrollContainer';

/**
 * Loading indicator for infinite scroll
 */
export interface LoadingIndicatorProps {
  isLoading: boolean;
  hasMore: boolean;
  message?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  hasMore,
  message,
  className = '',
}) => {
  if (!isLoading && !hasMore) {
    return (
      <div
        className={`flex items-center justify-center py-4 text-sm text-gray-500 ${className}`}
        role="status"
        aria-live="polite"
      >
        {message || 'No more items to load'}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center py-4 ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600">{message || 'Loading...'}</span>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Empty state component
 */
export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No items found',
  message = 'There are no items to display',
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
      role="status"
    >
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Scroll to top button
 */
export interface ScrollToTopButtonProps {
  onClick: () => void;
  show: boolean;
  className?: string;
  ariaLabel?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  onClick,
  show,
  className = '',
  ariaLabel = 'Scroll to top',
}) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};
