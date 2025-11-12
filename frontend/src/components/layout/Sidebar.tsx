import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
  { name: 'Lend/Borrow', href: '/lend-borrow', icon: HandCoins },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
  { name: 'AI Assistant', href: '/ai', icon: Sparkles },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Email', href: '/email', icon: Mail },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Activity Log', href: '/activity-log', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex w-64 flex-col border-r bg-background transition-colors">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-foreground" aria-label="Finance Management System">
          FMS
        </h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navigation.map((item) => (
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
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
