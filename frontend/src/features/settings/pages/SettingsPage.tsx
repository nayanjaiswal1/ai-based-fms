import AppearanceTab from '../components/AppearanceTab';
import CategoriesTab from '../components/CategoriesTab';
import TagsTab from '../components/TagsTab';
import RemindersTab from '../components/RemindersTab';
import OAuthTab from '../components/OAuthTab';
import SecurityTab from '../components/SecurityTab';
import SessionsTab from '../components/SessionsTab';
import PrivacyTab from '../components/PrivacyTab';
import { Tabs } from '@components/tabs';
import { getSettingsTabs, type SettingsTab } from '../config/settings.config';
import { useUrlParams } from '@/hooks/useUrlParams';

export default function SettingsPage() {
  const { getParam, setParam } = useUrlParams();

  // Get active tab from URL, default to 'appearance'
  const activeTab = (getParam('tab') as SettingsTab) || 'appearance';

  const tabs = getSettingsTabs();

  const handleTabChange = (tabId: string) => {
    setParam('tab', tabId);
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
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'tags' && <TagsTab />}
        {activeTab === 'reminders' && <RemindersTab />}
        {activeTab === 'oauth' && <OAuthTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'sessions' && <SessionsTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </div>
    </div>
  );
}
