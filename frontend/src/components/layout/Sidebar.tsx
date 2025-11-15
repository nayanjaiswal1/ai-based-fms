import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';
import { Tooltip } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Users,
  TrendingUp,
  BarChart3,
  Lightbulb,
  HandCoins,
  Sparkles,
  Upload,
  Mail,
  Bell,
  Activity,
  Settings,
  FileText,
  Server,
  ChevronDown,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  feature?: FeatureFlag;
}

// Core navigation items (always visible)
const coreNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, feature: FeatureFlag.DASHBOARD },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight, feature: FeatureFlag.TRANSACTIONS },
  { name: 'Accounts', href: '/accounts', icon: Wallet, feature: FeatureFlag.ACCOUNTS },
  { name: 'Budgets', href: '/budgets', icon: Target, feature: FeatureFlag.BUDGETS },
];

// Grouped navigation items
const navigationGroups = [
  {
    id: 'finance',
    label: 'Finance',
    defaultOpen: false,
    items: [
      { name: 'Money & People', href: '/shared-finance/groups', icon: Users, feature: FeatureFlag.GROUPS },
      { name: 'Investments', href: '/investments', icon: TrendingUp, feature: FeatureFlag.INVESTMENTS },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    defaultOpen: false,
    items: [
      { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3, feature: FeatureFlag.ADVANCED_ANALYTICS },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    defaultOpen: false,
    items: [
      { name: 'AI Assistant', href: '/ai', icon: Sparkles, feature: FeatureFlag.AI_ASSISTANT },
      { name: 'Import', href: '/import', icon: Upload, feature: FeatureFlag.ADVANCED_IMPORT },
      { name: 'Email', href: '/email', icon: Mail, feature: FeatureFlag.EMAIL_INTEGRATION },
    ],
  },
];

// System items (always at bottom)
const systemNavigation: NavigationItem[] = [
  { name: 'Notifications', href: '/notifications', icon: Bell, feature: FeatureFlag.NOTIFICATIONS },
  { name: 'Activity Log', href: '/activity-log', icon: Activity, feature: FeatureFlag.ACTIVITY_LOG },
  { name: 'Settings', href: '/settings/appearance', icon: Settings, feature: FeatureFlag.SETTINGS },
];

const adminNavigation: NavigationItem[] = [
  { name: 'Job Monitoring', href: '/admin/jobs', icon: Server, feature: FeatureFlag.ADMIN_PANEL },
];

interface NavItemProps {
  item: NavigationItem;
  onClick?: () => void;
}

function NavItem({ item, onClick }: NavItemProps) {
  const { hasAccess } = useFeatureAccess(item.feature || FeatureFlag.DASHBOARD);

  if (!hasAccess) {
    return (
      <Tooltip content="Upgrade to unlock this feature" side="right">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
          <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{item.name}</span>
          <Lock className="h-3 w-3 ml-auto flex-shrink-0" aria-hidden="true" />
        </div>
      </Tooltip>
    );
  }

  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          isActive
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        }`
      }
    >
      <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{item.name}</span>
    </NavLink>
  );
}

interface CollapsibleGroupProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  items: NavigationItem[];
}

function CollapsibleGroup({ label, isOpen, onToggle, items }: CollapsibleGroupProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1">
          {items.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Track which groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    navigationGroups.reduce((acc, group) => {
      acc[group.id] = group.defaultOpen;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="flex w-64 flex-col border-r bg-background transition-colors overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-foreground" aria-label="Finance Management System">
          FMS
        </h2>
      </div>

      {/* Scrollable navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="Main navigation">
        {/* Core Navigation (always visible) */}
        <div className="space-y-1 mb-4">
          {coreNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Grouped Navigation (collapsible) */}
        <div className="space-y-2 mb-4">
          {navigationGroups.map((group) => (
            <CollapsibleGroup
              key={group.id}
              label={group.label}
              isOpen={openGroups[group.id]}
              onToggle={() => toggleGroup(group.id)}
              items={group.items}
            />
          ))}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mb-4">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
            </div>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* System Navigation (pinned at bottom) */}
      <div className="border-t bg-background px-3 py-3">
        <div className="space-y-1">
          {systemNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
