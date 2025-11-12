import { AccountBalancesWidget } from '../components/widgets/AccountBalancesWidget';
import { TopSpendingWidget } from '../components/widgets/TopSpendingWidget';
import { SavingsRateWidget } from '../components/widgets/SavingsRateWidget';
import { FinancialHealthWidget } from '../components/widgets/FinancialHealthWidget';
import { UpcomingBillsWidget } from '../components/widgets/UpcomingBillsWidget';
import { InvestmentPerformanceWidget } from '../components/widgets/InvestmentPerformanceWidget';
import { GoalProgressWidget } from '../components/widgets/GoalProgressWidget';
import { CashFlowWidget } from '../components/widgets/CashFlowWidget';
import { NetWorthTrackerWidget } from '../components/widgets/NetWorthTrackerWidget';
import { StatCards } from '../components/StatCards';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { BudgetProgressWidget } from '../components/BudgetProgressWidget';
import { AccountsWidget } from '../components/AccountsWidget';
import { InvestmentsWidget } from '../components/InvestmentsWidget';
import { NetWorthBanner } from '../components/NetWorthBanner';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full-width';
export type WidgetCategory = 'financial' | 'budgets' | 'analytics' | 'goals' | 'investments';

export interface WidgetDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  category: WidgetCategory;
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
  component: React.ComponentType<any>;
  icon: string;
  requiresData?: string[];
  minWidth?: number;
  maxWidth?: number;
}

export const widgetRegistry: Record<string, WidgetDefinition> = {
  'total-balance': {
    id: 'total-balance',
    type: 'total-balance',
    name: 'Total Balance',
    description: 'Overview of all account balances',
    category: 'financial',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium'],
    component: StatCards,
    icon: 'Wallet',
    requiresData: ['accounts'],
  },
  'income-expense': {
    id: 'income-expense',
    type: 'income-expense',
    name: 'Income & Expenses',
    description: 'Monthly income and expense summary',
    category: 'financial',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    component: StatCards,
    icon: 'DollarSign',
    requiresData: ['stats'],
  },
  'recent-transactions': {
    id: 'recent-transactions',
    type: 'recent-transactions',
    name: 'Recent Transactions',
    description: 'Latest financial transactions',
    category: 'financial',
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full-width'],
    component: RecentTransactionsWidget,
    icon: 'List',
    requiresData: ['transactions'],
  },
  'spending-by-category': {
    id: 'spending-by-category',
    type: 'spending-by-category',
    name: 'Spending by Category',
    description: 'Breakdown of expenses by category',
    category: 'analytics',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    component: TopSpendingWidget,
    icon: 'PieChart',
    requiresData: ['categoryStats'],
  },
  'budget-overview': {
    id: 'budget-overview',
    type: 'budget-overview',
    name: 'Budget Overview',
    description: 'Budget progress and alerts',
    category: 'budgets',
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full-width'],
    component: BudgetProgressWidget,
    icon: 'Target',
    requiresData: ['budgets'],
  },
  'monthly-trend': {
    id: 'monthly-trend',
    type: 'monthly-trend',
    name: 'Monthly Trend',
    description: 'Income and expense trends over time',
    category: 'analytics',
    defaultSize: 'full-width',
    allowedSizes: ['large', 'full-width'],
    component: CashFlowWidget,
    icon: 'TrendingUp',
    requiresData: ['cashFlow'],
  },
  'account-balances': {
    id: 'account-balances',
    type: 'account-balances',
    name: 'Account Balances',
    description: 'Detailed view of all accounts',
    category: 'financial',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    component: AccountBalancesWidget,
    icon: 'Wallet',
    requiresData: ['accounts'],
  },
  'top-spending': {
    id: 'top-spending',
    type: 'top-spending',
    name: 'Top Spending Categories',
    description: 'Your highest expense categories',
    category: 'analytics',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    component: TopSpendingWidget,
    icon: 'TrendingDown',
    requiresData: ['categoryStats'],
  },
  'savings-rate': {
    id: 'savings-rate',
    type: 'savings-rate',
    name: 'Savings Rate Tracker',
    description: 'Track your savings percentage',
    category: 'financial',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium'],
    component: SavingsRateWidget,
    icon: 'PiggyBank',
    requiresData: ['stats'],
  },
  'financial-health': {
    id: 'financial-health',
    type: 'financial-health',
    name: 'Financial Health Score',
    description: 'Overall financial health metrics',
    category: 'analytics',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    component: FinancialHealthWidget,
    icon: 'Activity',
    requiresData: ['healthMetrics'],
  },
  'upcoming-bills': {
    id: 'upcoming-bills',
    type: 'upcoming-bills',
    name: 'Upcoming Bills',
    description: 'Bills and payments due soon',
    category: 'financial',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    component: UpcomingBillsWidget,
    icon: 'Calendar',
    requiresData: ['bills'],
  },
  'investment-performance': {
    id: 'investment-performance',
    type: 'investment-performance',
    name: 'Investment Performance',
    description: 'Portfolio performance and returns',
    category: 'investments',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    component: InvestmentPerformanceWidget,
    icon: 'TrendingUp',
    requiresData: ['portfolio'],
  },
  'goal-progress': {
    id: 'goal-progress',
    type: 'goal-progress',
    name: 'Goal Progress',
    description: 'Track your financial goals',
    category: 'goals',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    component: GoalProgressWidget,
    icon: 'Target',
    requiresData: ['goals'],
  },
  'cash-flow': {
    id: 'cash-flow',
    type: 'cash-flow',
    name: 'Cash Flow Chart',
    description: 'Monthly cash flow visualization',
    category: 'analytics',
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full-width'],
    component: CashFlowWidget,
    icon: 'DollarSign',
    requiresData: ['cashFlow'],
  },
  'net-worth': {
    id: 'net-worth',
    type: 'net-worth',
    name: 'Net Worth Tracker',
    description: 'Track your net worth over time',
    category: 'analytics',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large', 'full-width'],
    component: NetWorthTrackerWidget,
    icon: 'TrendingUp',
    requiresData: ['netWorth'],
  },
  'investments-summary': {
    id: 'investments-summary',
    type: 'investments-summary',
    name: 'Investments Summary',
    description: 'Quick investment portfolio overview',
    category: 'investments',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium'],
    component: InvestmentsWidget,
    icon: 'TrendingUp',
    requiresData: ['portfolio'],
  },
};

export const getWidgetsByCategory = (category: WidgetCategory) => {
  return Object.values(widgetRegistry).filter(widget => widget.category === category);
};

export const getAllWidgets = () => {
  return Object.values(widgetRegistry);
};

export const getWidgetDefinition = (type: string) => {
  return widgetRegistry[type];
};

export const getSizeClass = (size: WidgetSize): string => {
  switch (size) {
    case 'small':
      return 'col-span-1';
    case 'medium':
      return 'col-span-1 md:col-span-1';
    case 'large':
      return 'col-span-1 md:col-span-2';
    case 'full-width':
      return 'col-span-1 md:col-span-3';
    default:
      return 'col-span-1';
  }
};
