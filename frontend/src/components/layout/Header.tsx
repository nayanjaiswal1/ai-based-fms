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
      className="relative flex h-16 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-md px-4 sm:px-6 transition-all duration-300 animate-fade-in-down"
      role="banner"
    >
      {/* Subtle accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="group rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary lg:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open navigation menu"
          aria-expanded="false"
          type="button"
        >
          <Menu className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
        </button>

        <h1 className="font-serif text-2xl font-bold tracking-tight text-gradient" aria-label="Finance Management System">
          FMS
        </h1>
      </div>

      <div className="relative flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="User actions">
        <ThemeToggleButton />

        {/* Notification button */}
        <button
          onClick={handleNotificationClick}
          className="group relative rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-accent/20 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="View notifications"
          type="button"
        >
          <Bell className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" aria-hidden="true" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary transition-all duration-200 hover:shadow-glow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`${user?.firstName} ${user?.lastName} - Profile menu`}
            aria-expanded={isProfileOpen}
            type="button"
          >
            <User className="h-5 w-5 text-primary-foreground transition-transform group-hover:scale-110" aria-hidden="true" />
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border/50 bg-card/95 backdrop-blur-md shadow-xl z-50 animate-scale-in overflow-hidden">
              {/* Subtle gradient border effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50 pointer-events-none" />

              <div className="relative px-4 py-3 border-b border-border/50">
                <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <div className="relative py-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings/profile');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent/20 transition-all duration-200 group"
                  type="button"
                >
                  <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden="true" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings/subscription');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent/20 transition-all duration-200 group"
                  type="button"
                >
                  <CreditCard className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                  <span>Subscription</span>
                </button>
              </div>
              <div className="relative border-t border-border/50 py-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all duration-200 group"
                  type="button"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
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
