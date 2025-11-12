/**
 * Accessibility configuration and constants for WCAG 2.1 AA compliance
 */

/**
 * WCAG 2.1 AA Contrast Ratios
 */
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5, // Normal text (< 18pt or < 14pt bold)
  AA_LARGE: 3.0, // Large text (>= 18pt or >= 14pt bold)
  AAA_NORMAL: 7.0, // Enhanced normal text
  AAA_LARGE: 4.5, // Enhanced large text
} as const;

/**
 * Keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = {
  SEARCH: { key: 'k', modifiers: ['ctrl', 'meta'] },
  HELP: { key: '?', modifiers: ['shift'] },
  CLOSE_MODAL: { key: 'Escape', modifiers: [] },
  SUBMIT_FORM: { key: 'Enter', modifiers: ['ctrl', 'meta'] },
  NAVIGATION: {
    DASHBOARD: { key: 'd', modifiers: ['alt'] },
    TRANSACTIONS: { key: 't', modifiers: ['alt'] },
    REPORTS: { key: 'r', modifiers: ['alt'] },
    SETTINGS: { key: 's', modifiers: ['alt'] },
  },
} as const;

/**
 * ARIA live region politeness levels
 */
export const ARIA_LIVE = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const;

/**
 * Common ARIA roles
 */
export const ARIA_ROLES = {
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  BANNER: 'banner',
  BUTTON: 'button',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  DIALOG: 'dialog',
  FORM: 'form',
  MAIN: 'main',
  NAVIGATION: 'navigation',
  REGION: 'region',
  SEARCH: 'search',
  STATUS: 'status',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TOOLTIP: 'tooltip',
} as const;

/**
 * Focus trap configuration
 */
export const FOCUS_TRAP_CONFIG = {
  // Elements to include in focus trap
  FOCUSABLE_SELECTORS: [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ],
  // Auto focus first element when trap activates
  AUTO_FOCUS: true,
  // Return focus to trigger element when trap deactivates
  RETURN_FOCUS: true,
} as const;

/**
 * Screen reader only CSS class
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Accessible color palette for charts and data visualization
 * These colors are distinguishable and meet WCAG AA contrast requirements
 */
export const ACCESSIBLE_COLORS = {
  PRIMARY: '#2563eb', // Blue
  SUCCESS: '#16a34a', // Green
  WARNING: '#ea580c', // Orange
  DANGER: '#dc2626', // Red
  INFO: '#0891b2', // Cyan
  NEUTRAL: '#64748b', // Gray
  PURPLE: '#9333ea', // Purple
  PINK: '#db2777', // Pink
} as const;

/**
 * Chart patterns for colorblind users
 */
export const CHART_PATTERNS = {
  DOTS: 'dots',
  LINES: 'lines',
  DIAGONAL: 'diagonal',
  CROSS: 'cross',
  ZIGZAG: 'zigzag',
  WAVE: 'wave',
} as const;

/**
 * Accessible font sizes
 */
export const FONT_SIZES = {
  SMALL: '14px',
  NORMAL: '16px',
  LARGE: '18px', // Large text threshold for WCAG
  XLARGE: '24px',
} as const;

/**
 * Minimum touch target size (44x44px per WCAG 2.1)
 */
export const MIN_TOUCH_TARGET = {
  WIDTH: 44,
  HEIGHT: 44,
} as const;

/**
 * Animation duration preferences
 */
export const ANIMATION_DURATION = {
  NONE: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Timeout durations for announcements
 */
export const ANNOUNCEMENT_TIMEOUT = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
} as const;

/**
 * Skip navigation targets
 */
export const SKIP_NAV_TARGETS = {
  MAIN_CONTENT: '#main-content',
  NAVIGATION: '#navigation',
  SEARCH: '#search',
} as const;

/**
 * Form validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
  PATTERN: 'Please match the requested format',
  MIN_VALUE: (min: number) => `Minimum value is ${min}`,
  MAX_VALUE: (max: number) => `Maximum value is ${max}`,
} as const;

/**
 * Loading state messages for screen readers
 */
export const LOADING_MESSAGES = {
  LOADING: 'Loading, please wait',
  SAVING: 'Saving changes',
  DELETING: 'Deleting item',
  FETCHING: 'Fetching data',
  PROCESSING: 'Processing request',
} as const;

/**
 * Success messages for screen readers
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  DELETED: 'Item deleted successfully',
  CREATED: 'Item created successfully',
  UPDATED: 'Item updated successfully',
} as const;

/**
 * Error messages for screen readers
 */
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please fix the validation errors.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested item was not found.',
} as const;

/**
 * Page titles for route changes (announced to screen readers)
 */
export const PAGE_TITLES = {
  DASHBOARD: 'Dashboard',
  TRANSACTIONS: 'Transactions',
  REPORTS: 'Reports',
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  LOGIN: 'Login',
  REGISTER: 'Register',
} as const;

/**
 * Accessible heading levels
 */
export const HEADING_LEVELS = {
  PAGE_TITLE: 'h1',
  SECTION_TITLE: 'h2',
  SUBSECTION_TITLE: 'h3',
  CARD_TITLE: 'h4',
} as const;

/**
 * Landmark regions
 */
export const LANDMARK_REGIONS = {
  BANNER: 'banner',
  MAIN: 'main',
  NAVIGATION: 'navigation',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  FORM: 'form',
  REGION: 'region',
} as const;
