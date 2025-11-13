import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { SkipNav } from '@/components/a11y';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const queryClient = useQueryClient();

  // Initialize WebSocket connection
  const { connected, on } = useWebSocket({
    namespace: '/notifications',
    autoConnect: true,
    onConnect: () => {
      console.log('✅ Connected to real-time notifications');
    },
    onDisconnect: () => {
      console.log('⚠️ Disconnected from real-time notifications. Retrying...');
    },
    onError: (error) => {
      console.error('❌ WebSocket connection error:', error);
    },
  });

  // Listen for notification events
  useEffect(() => {
    on('notification', (notification) => {
      console.log('🔔 Received notification:', notification);
      // Invalidate notifications cache to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    on('unreadCount', (data) => {
      console.log('📬 Updated unread count:', data.count);
      // Update unread count query
      queryClient.setQueryData(['notifications-unread-count'], data);
    });
  }, [on, queryClient]);

  const handleOpenMobileNav = () => {
    setIsMobileNavOpen(true);
  };

  const handleCloseMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="flex h-screen bg-secondary transition-colors">
      {/* Skip Navigation for accessibility */}
      <SkipNav />

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block" aria-label="Main navigation">
        <Sidebar />
      </aside>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={handleCloseMobileNav} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={handleOpenMobileNav} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-secondary p-4 sm:p-6"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
