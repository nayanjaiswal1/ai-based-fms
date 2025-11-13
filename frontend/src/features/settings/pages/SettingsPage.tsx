import { useParams, useNavigate, Navigate } from 'react-router-dom';
import AppearanceTab from '../components/AppearanceTab';
import CategoriesTab from '../components/CategoriesTab';
import TagsTab from '../components/TagsTab';
import RemindersTab from '../components/RemindersTab';
import OAuthTab from '../components/OAuthTab';
import SecurityTab from '../components/SecurityTab';
import SessionsTab from '../components/SessionsTab';
import PrivacyTab from '../components/PrivacyTab';
import { Tabs } from '@components/tabs';
import { ErrorBoundary } from '@/components/error-boundary';
import { getSettingsTabs, type SettingsTab } from '../config/settings.config';

export default function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Get active tab from URL path, default to 'appearance'
  const activeTab = (tab as SettingsTab) || 'appearance';

  // Valid tabs list for validation
  const validTabs: SettingsTab[] = ['appearance', 'categories', 'tags', 'reminders', 'oauth', 'security', 'sessions', 'privacy'];

  // Redirect to default tab if no tab specified or invalid tab
  if (!tab) {
    return <Navigate to="/settings/appearance" replace />;
  }

  if (!validTabs.includes(tab as SettingsTab)) {
    return <Navigate to="/settings/appearance" replace />;
  }

  const tabs = getSettingsTabs();

  const handleTabChange = (tabId: string) => {
    navigate(`/settings/${tabId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your appearance, categories, tags, reminders, security, sessions, privacy, and OAuth connections
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="underline"
      />

      {/* Tab Content */}
      <div className="rounded-lg bg-card p-6 shadow transition-colors">
        <ErrorBoundary level="component">
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'tags' && <TagsTab />}
          {activeTab === 'reminders' && <RemindersTab />}
          {activeTab === 'oauth' && <OAuthTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
        </ErrorBoundary>
      </div>
    </div>
  );
}
