import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Users,
  TrendingUp,
  BarChart3,
  HandCoins,
  Sparkles,
  Upload,
  Mail,
  Bell,
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
  { name: 'AI Assistant', href: '/ai', icon: Sparkles },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Email', href: '/email', icon: Mail },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex w-64 flex-col border-r bg-background transition-colors">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-foreground">FMS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
