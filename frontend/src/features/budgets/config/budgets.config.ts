/**
 * Budget progress thresholds
 */
export const BUDGET_THRESHOLDS = {
  WARNING: 75, // Show yellow color at 75%
  DANGER: 90,  // Show red color at 90%
} as const;

/**
 * Get progress color based on percentage spent
 */
export function getBudgetProgressColor(percentage: number): string {
  if (percentage >= BUDGET_THRESHOLDS.DANGER) return 'bg-red-500';
  if (percentage >= BUDGET_THRESHOLDS.WARNING) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Get progress text color based on percentage spent
 */
export function getBudgetProgressTextColor(percentage: number): string {
  if (percentage >= BUDGET_THRESHOLDS.DANGER) return 'text-red-600';
  if (percentage >= BUDGET_THRESHOLDS.WARNING) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Format budget period for display
 */
export function formatBudgetPeriod(period: string): string {
  const words = period.split('_');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
