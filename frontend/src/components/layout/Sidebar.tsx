import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useAuthStore } from '@stores/authStore';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, ChevronDown } from 'lucide-react';
import {
  coreMenuItems,
  menuGroups,
  systemMenuItems,
  adminMenuItems,
  SidebarMenuItem,
  SidebarMenuGroup,
} from '@/config/sidebar.config';

interface NavItemProps {
  item: SidebarMenuItem;
}

function NavItem({ item }: NavItemProps) {
  const { hasAccess } = useFeatureAccess(item.feature || FeatureFlag.DASHBOARD);
  const Icon = item.icon;

  if (!hasAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed opacity-60 hover:bg-accent/30 transition-colors">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              <Lock className="h-3 w-3 flex-shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Upgrade to unlock this feature</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          isActive
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        }`
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{item.label}</span>
    </NavLink>
  );
}

interface CollapsibleMenuGroupProps {
  group: SidebarMenuGroup;
}

function CollapsibleMenuGroup({ group }: CollapsibleMenuGroupProps) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen || false);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
        <span>{group.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-1 space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {group.items.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex w-64 flex-col border-r bg-background transition-colors h-full">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-foreground" aria-label="Finance Management System">
          FMS
        </h2>
      </div>

      {/* Scrollable navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 min-h-0" aria-label="Main navigation">
        {/* Core Navigation (always visible) */}
        <div className="space-y-1 mb-4">
          {coreMenuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Grouped Navigation (collapsible) */}
        <div className="space-y-2 mb-4">
          {menuGroups.map((group) => (
            <CollapsibleMenuGroup key={group.id} group={group} />
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
              {adminMenuItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* System Navigation (pinned at bottom) */}
      <div className="border-t bg-background px-3 py-3 flex-shrink-0">
        <div className="space-y-1">
          {systemMenuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
