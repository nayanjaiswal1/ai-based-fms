import { useState } from 'react';
import CategoriesTab from '../components/CategoriesTab';
import TagsTab from '../components/TagsTab';
import RemindersTab from '../components/RemindersTab';
import OAuthTab from '../components/OAuthTab';
import { Tabs } from '@components/tabs';
import { getSettingsTabs, type SettingsTab } from '../config/settings.config';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');

  const tabs = getSettingsTabs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your categories, tags, reminders, and OAuth connections
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as SettingsTab)}
        variant="underline"
      />

      {/* Tab Content */}
      <div className="rounded-lg bg-white p-6 shadow">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'tags' && <TagsTab />}
        {activeTab === 'reminders' && <RemindersTab />}
        {activeTab === 'oauth' && <OAuthTab />}
      </div>
    </div>
  );
}
