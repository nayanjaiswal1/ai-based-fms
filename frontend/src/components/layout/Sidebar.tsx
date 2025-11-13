import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
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
} from 'lucide-react';

// Core navigation items (always visible)
const coreNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: Target },
];

// Grouped navigation items
const navigationGroups = [
  {
    id: 'finance',
    label: 'Finance',
    defaultOpen: false,
    items: [
      { name: 'Groups', href: '/groups', icon: Users },
      { name: 'Investments', href: '/investments', icon: TrendingUp },
      { name: 'Lend/Borrow', href: '/lend-borrow', icon: HandCoins },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    defaultOpen: false,
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Insights', href: '/insights', icon: Lightbulb },
      { name: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    defaultOpen: false,
    items: [
      { name: 'AI Assistant', href: '/ai', icon: Sparkles },
      { name: 'Import', href: '/import', icon: Upload },
      { name: 'Email', href: '/email', icon: Mail },
    ],
  },
];

// System items (always at bottom)
const systemNavigation = [
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Activity Log', href: '/activity-log', icon: Activity },
  { name: 'Settings', href: '/settings/appearance', icon: Settings },
];

const adminNavigation = [
  { name: 'Job Monitoring', href: '/admin/jobs', icon: Server },
];

interface CollapsibleGroupProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  items: Array<{ name: string; href: string; icon: any }>;
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
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
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
    <div className="flex w-64 flex-col border-r bg-background transition-colors">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-foreground" aria-label="Finance Management System">
          FMS
        </h2>
      </div>

      {/* Scrollable navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {/* Core Navigation (always visible) */}
        <div className="space-y-1 mb-4">
          {coreNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
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
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      isActive
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* System Navigation (pinned at bottom) */}
      <div className="border-t bg-background px-3 py-3">
        <div className="space-y-1">
          {systemNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
