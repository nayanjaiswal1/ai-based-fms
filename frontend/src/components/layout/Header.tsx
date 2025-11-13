import { useAuthStore } from '@stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu } from 'lucide-react';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { SubscriptionStatus } from '@/components/subscription';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 transition-colors"
      role="banner"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Open navigation menu"
          aria-expanded="false"
          type="button"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Mobile: Show only FMS, Desktop: Show welcome message */}
        <h1 className="text-lg font-semibold text-foreground">
          <span className="lg:hidden" aria-label="Finance Management System">FMS</span>
          <span className="hidden lg:inline">Welcome back, {user?.firstName}!</span>
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="User actions">
        {/* Subscription Status - Hidden on small screens */}
        <div className="hidden md:block">
          <SubscriptionStatus variant="compact" showUpgrade={false} />
        </div>

        <ThemeToggleButton />

        {/* Hide bell icon on very small screens */}
        <button
          className="hidden xs:block rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="View notifications"
          type="button"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
            aria-label={`${user?.firstName} ${user?.lastName}`}
            role="img"
          >
            <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>

          {/* Show logout text only on larger screens */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Log out of your account"
            type="button"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
