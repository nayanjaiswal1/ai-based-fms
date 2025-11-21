import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Settings,
  Server,
} from 'lucide-react';
import { FeatureFlag } from './features.config';

export interface SidebarMenuItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  feature?: FeatureFlag;
  badge?: string;
  children?: SidebarMenuItem[];
}

export interface SidebarMenuGroup {
  id: string;
  label: string;
  defaultOpen?: boolean;
  items: SidebarMenuItem[];
}

/**
 * Core navigation items (always visible at the top)
 */
export const coreMenuItems: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    feature: FeatureFlag.DASHBOARD,
  },
  {
    id: 'transactions',
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
    feature: FeatureFlag.TRANSACTIONS,
  },
  {
    id: 'accounts',
    label: 'Accounts',
    href: '/accounts',
    icon: Wallet,
    feature: FeatureFlag.ACCOUNTS,
  },
  {
    id: 'budgets',
    label: 'Budgets',
    href: '/budgets',
    icon: Target,
    feature: FeatureFlag.BUDGETS,
  },
];

/**
 * Grouped navigation items (collapsible sections)
 */
export const menuGroups: SidebarMenuGroup[] = [
  {
    id: 'finance',
    label: 'Finance',
    defaultOpen: false,
    items: [
      {
        id: 'shared-finance',
        label: 'Money & People',
        href: '/shared-finance/groups',
        icon: Users,
        feature: FeatureFlag.GROUPS,
      },
      {
        id: 'investments',
        label: 'Investments',
        href: '/investments',
        icon: TrendingUp,
        feature: FeatureFlag.INVESTMENTS,
      },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    defaultOpen: false,
    items: [
      {
        id: 'analytics',
        label: 'Analytics & Reports',
        href: '/analytics',
        icon: BarChart3,
        feature: FeatureFlag.ADVANCED_ANALYTICS,
      },
    ],
  },
];

/**
 * System navigation items (pinned at bottom)
 */
export const systemMenuItems: SidebarMenuItem[] = [
  {
    id: 'activity-log',
    label: 'Activity Log',
    href: '/activity-log',
    icon: Activity,
    feature: FeatureFlag.ACTIVITY_LOG,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings/appearance',
    icon: Settings,
    feature: FeatureFlag.SETTINGS,
  },
];

/**
 * Admin navigation items (only visible to admins)
 */
export const adminMenuItems: SidebarMenuItem[] = [
  {
    id: 'admin-jobs',
    label: 'Job Monitoring',
    href: '/admin/jobs',
    icon: Server,
    feature: FeatureFlag.ADMIN_PANEL,
  },
];
