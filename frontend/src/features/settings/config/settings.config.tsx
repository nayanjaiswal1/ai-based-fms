import { Folder, Tag, Bell, Key, Shield } from 'lucide-react';
import { TabConfig } from '@components/tabs';

export type SettingsTab = 'categories' | 'tags' | 'reminders' | 'oauth' | 'security';

export const getSettingsTabs = (): TabConfig[] => [
  {
    id: 'categories',
    label: 'Categories',
    icon: <Folder className="h-5 w-5" />,
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: <Tag className="h-5 w-5" />,
  },
  {
    id: 'reminders',
    label: 'Reminders',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: 'oauth',
    label: 'OAuth',
    icon: <Key className="h-5 w-5" />,
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="h-5 w-5" />,
  },
];
