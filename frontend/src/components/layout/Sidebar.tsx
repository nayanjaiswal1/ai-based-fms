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
    <div className="flex w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">FMS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
