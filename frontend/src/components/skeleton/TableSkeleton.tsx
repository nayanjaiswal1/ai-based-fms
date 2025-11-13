import { memo } from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

/**
 * Optimized table skeleton with minimal re-renders
 * Uses CSS animations instead of JS for better performance
 */
export const TableSkeleton = memo(({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps) => {
  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className="mb-2 flex gap-4 border-b border-gray-200 pb-2">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
                <div
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{
                    width: `${70 + Math.random() * 30}%`,
                    animationDelay: `${rowIndex * 50}ms`
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

TableSkeleton.displayName = 'TableSkeleton';
