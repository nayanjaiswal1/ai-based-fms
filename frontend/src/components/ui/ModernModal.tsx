import { ReactNode, useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { ARIA_ROLES } from '@/config/accessibility';

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  fullScreenOnMobile?: boolean;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-7xl',
};

export function ModernModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  closeOnOverlayClick = true,
  fullScreenOnMobile = true,
}: ModernModalProps) {
  const isMobile = useIsMobile();
  const titleId = useId();
  const descriptionId = useId();

  // Focus trap for accessibility
  const modalRef = useFocusTrap({
    isActive: isOpen,
    autoFocus: true,
    restoreFocus: true,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex ${isMobile && fullScreenOnMobile ? 'items-stretch' : 'items-center justify-center'}`}
      role="presentation"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role={ARIA_ROLES.DIALOG}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`
          relative z-10 flex w-full flex-col bg-white dark:bg-gray-800 shadow-2xl
          ${isMobile && fullScreenOnMobile
            ? 'h-full rounded-none max-h-full'
            : 'm-4 max-h-[90vh] rounded-lg sm:rounded-2xl'
          }
          ${sizeClasses[size]}
          animate-in fade-in-0 ${isMobile && fullScreenOnMobile ? 'slide-in-from-bottom' : 'zoom-in-95'} duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex-1 min-w-0">
            <h2
              id={titleId}
              className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 sm:ml-4 rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close modal"
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg sm:rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
