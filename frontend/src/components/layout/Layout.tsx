import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { SkipNav } from '@/components/a11y';

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
