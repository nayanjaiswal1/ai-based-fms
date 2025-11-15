/**
 * UI utility functions for common patterns
 */

/**
 * Get icon component for account type
 */
export const getAccountIcon = (type: string) => {
  const icons = {
    bank: 'Banknote',
    card: 'CreditCard',
    wallet: 'Wallet',
    cash: 'DollarSign',
  };
  return icons[type as keyof typeof icons] || 'Wallet';
};

/**
 * Get color class for account type
 */
export const getAccountTypeColor = (type: string): string => {
  const colors = {
    bank: 'bg-blue-500',
    card: 'bg-purple-500',
    wallet: 'bg-green-500',
    cash: 'bg-yellow-500',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-500';
};

/**
 * Get color class for transaction type
 */
export const getTransactionTypeColor = (type: string): string => {
  return type === 'income' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
};

/**
 * Get badge color for budget status
 */
export const getBudgetStatusColor = (spent: number, total: number): string => {
  const percentage = (spent / total) * 100;
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  if (percentage >= 50) return 'bg-blue-500';
  return 'bg-green-500';
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return d.toLocaleDateString('en-US');
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};
