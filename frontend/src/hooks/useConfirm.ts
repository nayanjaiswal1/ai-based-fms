import { useState } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
}

/**
 * Hook for managing confirmation dialogs
 *
 * Usage:
 * ```typescript
 * const { confirmState, confirm, closeConfirm } = useConfirm();
 *
 * const handleDelete = async () => {
 *   confirm({
 *     title: 'Delete Account',
 *     message: 'Are you sure you want to delete this account?',
 *     variant: 'danger',
 *     onConfirm: async () => {
 *       await deleteAccount(id);
 *     }
 *   });
 * };
 *
 * // In JSX:
 * <ConfirmDialog
 *   {...confirmState}
 *   onClose={closeConfirm}
 * />
 * ```
 */
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'warning',
    onConfirm: () => {},
  });

  const confirm = (options: ConfirmOptions & { onConfirm: () => void }) => {
    setConfirmState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || 'Confirm',
      cancelLabel: options.cancelLabel || 'Cancel',
      variant: options.variant || 'warning',
      onConfirm: options.onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    confirmState,
    confirm,
    closeConfirm,
  };
}
