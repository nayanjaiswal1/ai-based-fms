import { memo } from 'react';

interface CardSkeletonProps {
  count?: number;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Optimized card skeleton for list views
 * Memoized to prevent unnecessary re-renders
 */
export const CardSkeleton = memo(({ count = 3, variant = 'default' }: CardSkeletonProps) => {
  const renderCard = (index: number) => {
    switch (variant) {
      case 'compact':
        return (
          <div key={`card-${index}`} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div key={`card-${index}`} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
              <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
          </div>
        );

      default:
        return (
          <div key={`card-${index}`} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => renderCard(i))}
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';
