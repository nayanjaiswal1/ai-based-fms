import { useCallback, useEffect, useRef, useState } from 'react';

export interface FormProtectionOptions {
  /**
   * Enable browser navigation protection (beforeunload event)
   * @default false
   */
  enableBrowserPrompt?: boolean;

  /**
   * Custom message for confirmation dialog
   * @default 'You have unsaved changes. Are you sure you want to close?'
   */
  confirmMessage?: string;

  /**
   * Custom confirm function (e.g., from useConfirm hook)
   * IMPORTANT: Must be provided to show confirmation dialogs
   */
  onConfirm?: (message: string) => Promise<boolean>;
}

export function useFormProtection(options: FormProtectionOptions = {}) {
  const [isDirty, setIsDirty] = useState(false);
  const confirmMessageRef = useRef(
    options.confirmMessage || 'You have unsaved changes. Are you sure you want to close?'
  );

  // Browser navigation protection
  useEffect(() => {
    if (!options.enableBrowserPrompt || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, options.enableBrowserPrompt]);

  /**
   * Check if close action should be allowed
   * Returns true if safe to close, false if should block
   */
  const checkBeforeClose = useCallback(async () => {
    if (!isDirty) return true;

    if (options.onConfirm) {
      return await options.onConfirm(confirmMessageRef.current);
    }

    // No confirm function provided - log warning and allow close
    console.warn('useFormProtection: No onConfirm callback provided. Please use useConfirm hook.');
    return true;
  }, [isDirty, options]);

  /**
   * Mark form as dirty (has unsaved changes)
   */
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  /**
   * Mark form as clean (changes saved or discarded)
   */
  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  /**
   * Reset dirty state (alias for markClean)
   */
  const reset = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    isDirty,
    setIsDirty,
    markDirty,
    markClean,
    reset,
    checkBeforeClose,
  };
}
