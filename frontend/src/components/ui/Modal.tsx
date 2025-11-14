import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  fullScreenOnMobile?: boolean;
  /**
   * Callback to check before closing. Return false to prevent close.
   * Use with useFormProtection hook for unsaved changes protection.
   */
  onBeforeClose?: () => boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-7xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  closeOnOverlayClick = true,
  onBeforeClose,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onBeforeClose={onBeforeClose}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="flex-shrink-0 px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Add horizontal line below header */}
        <div className="border-t border-border/50 flex-shrink-0" />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {children}
        </div>

        {/* Fixed footer at bottom */}
        {footer && (
          <>
            <div className="border-t border-border/50 flex-shrink-0" />
            <DialogFooter className="flex-shrink-0 px-6 py-4 bg-muted/30">
              {footer}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
