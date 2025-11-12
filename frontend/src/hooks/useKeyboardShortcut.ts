import { useEffect, useCallback, useRef } from 'react';

type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';

interface KeyboardShortcutOptions {
  /**
   * The key to listen for (e.g., 'k', 'Enter', 'Escape')
   */
  key: string;
  /**
   * Modifier keys that must be pressed (ctrl, alt, shift, meta/cmd)
   */
  modifiers?: ModifierKey[];
  /**
   * Callback function to execute when shortcut is triggered
   */
  callback: () => void;
  /**
   * Whether the shortcut is enabled
   */
  enabled?: boolean;
  /**
   * Whether to prevent default browser behavior
   */
  preventDefault?: boolean;
  /**
   * Whether to stop event propagation
   */
  stopPropagation?: boolean;
  /**
   * Description of the shortcut (for accessibility/documentation)
   */
  description?: string;
  /**
   * Elements to ignore (e.g., don't trigger in input fields)
   */
  ignoreElements?: string[];
}

/**
 * Hook to register keyboard shortcuts for improved accessibility
 * Implements WCAG 2.1 AA keyboard accessibility requirements
 */
export function useKeyboardShortcut({
  key,
  modifiers = [],
  callback,
  enabled = true,
  preventDefault = true,
  stopPropagation = false,
  description,
  ignoreElements = ['INPUT', 'TEXTAREA', 'SELECT'],
}: KeyboardShortcutOptions) {
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if shortcut is enabled
      if (!enabled) return;

      // Ignore if focus is on specified elements
      const target = event.target as HTMLElement;
      if (ignoreElements.includes(target.tagName)) {
        return;
      }

      // Ignore if element is contenteditable
      if (target.isContentEditable) {
        return;
      }

      // Check if key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      if (!keyMatches) return;

      // Check modifier keys
      const ctrlMatch = modifiers.includes('ctrl') ? event.ctrlKey : !event.ctrlKey;
      const altMatch = modifiers.includes('alt') ? event.altKey : !event.altKey;
      const shiftMatch = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
      const metaMatch = modifiers.includes('meta') ? event.metaKey : !event.metaKey;

      // Special handling for ctrl/meta (cmd on Mac, ctrl on Windows/Linux)
      let commandMatch = true;
      if (modifiers.includes('ctrl') || modifiers.includes('meta')) {
        commandMatch = event.ctrlKey || event.metaKey;
        // If ctrl or meta is required, we override the individual checks
        if (modifiers.includes('ctrl') && modifiers.includes('meta')) {
          // Both specified, both must be pressed
          commandMatch = event.ctrlKey && event.metaKey;
        }
      } else {
        // Neither ctrl nor meta should be pressed
        commandMatch = !event.ctrlKey && !event.metaKey;
      }

      // Check if all modifiers match
      if (!ctrlMatch || !altMatch || !shiftMatch) {
        return;
      }

      // Special handling for ctrl/meta
      if (modifiers.includes('ctrl') || modifiers.includes('meta')) {
        if (!commandMatch) return;
      } else {
        if (!metaMatch) return;
      }

      // All checks passed, execute callback
      if (preventDefault) {
        event.preventDefault();
      }
      if (stopPropagation) {
        event.stopPropagation();
      }

      callbackRef.current();
    },
    [key, modifiers, enabled, preventDefault, stopPropagation, ignoreElements]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  // Return shortcut info for accessibility
  return {
    key,
    modifiers,
    description,
    enabled,
  };
}

/**
 * Hook to register multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: Omit<KeyboardShortcutOptions, 'callback'>[]
) {
  shortcuts.forEach((shortcut) => {
    useKeyboardShortcut(shortcut as KeyboardShortcutOptions);
  });

  return shortcuts;
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(
  key: string,
  modifiers: ModifierKey[] = []
): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (modifiers.includes('ctrl') || modifiers.includes('meta')) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (modifiers.includes('alt')) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (modifiers.includes('shift')) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  // Format key
  const formattedKey = key.length === 1 ? key.toUpperCase() : key;
  parts.push(formattedKey);

  return parts.join(isMac ? '' : '+');
}
