import { useState } from 'react';
import { Folder, Tag, Bell, Mail } from 'lucide-react';
import CategoriesTab from '../components/CategoriesTab';
import TagsTab from '../components/TagsTab';
import RemindersTab from '../components/RemindersTab';

type Tab = 'categories' | 'tags' | 'reminders';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('categories');

  const tabs = [
    { id: 'categories' as Tab, label: 'Categories', icon: Folder },
    { id: 'tags' as Tab, label: 'Tags', icon: Tag },
    { id: 'reminders' as Tab, label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your categories, tags, and reminders
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg bg-white p-6 shadow">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'tags' && <TagsTab />}
        {activeTab === 'reminders' && <RemindersTab />}
      </div>
    </div>
  );
}
