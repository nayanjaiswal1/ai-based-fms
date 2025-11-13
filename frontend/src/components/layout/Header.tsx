import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu, Settings, CreditCard } from 'lucide-react';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        <h1 className="text-lg font-semibold text-foreground" aria-label="Finance Management System">
          FMS
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="User actions">
        <ThemeToggleButton />

        {/* Notification button */}
        <button
          onClick={handleNotificationClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="View notifications"
          type="button"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`${user?.firstName} ${user?.lastName} - Profile menu`}
            aria-expanded={isProfileOpen}
            type="button"
          >
            <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover shadow-lg z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings/profile');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  type="button"
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings/subscription');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  type="button"
                >
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  <span>Subscription</span>
                </button>
              </div>
              <div className="border-t py-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                  type="button"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
