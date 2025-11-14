import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Tabs } from '@components/tabs';
import { ErrorBoundary } from '@/components/error-boundary';
import { getSettingsTabs, type SettingsTab } from '../config/settings.config';

export default function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract active tab from current path (e.g., /settings/appearance -> appearance)
  const pathSegments = location.pathname.split('/');
  const activeTab = (pathSegments[pathSegments.length - 1] as SettingsTab) || 'appearance';

  const tabs = getSettingsTabs();

  const handleTabChange = (tabId: string) => {
    navigate(`/settings/${tabId}`);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="underline"
      />

      {/* Tab Content - Rendered via nested routes with Outlet */}
      <div className="rounded-lg bg-card p-6 shadow transition-colors">
        <ErrorBoundary level="component">
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}
