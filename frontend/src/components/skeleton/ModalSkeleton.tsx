import { memo } from 'react';

interface ModalSkeletonProps {
  fields?: number;
  showFooter?: boolean;
}

/**
 * Optimized modal/form skeleton
 * Lightweight and performant
 */
export const ModalSkeleton = memo(({ fields = 4, showFooter = true }: ModalSkeletonProps) => {
  return (
    <div className="space-y-6">
      {/* Modal Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mt-2" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={`field-${i}`}>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2" />
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
          </div>
        ))}
      </div>

      {/* Modal Footer */}
      {showFooter && (
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      )}
    </div>
  );
});

ModalSkeleton.displayName = 'ModalSkeleton';
