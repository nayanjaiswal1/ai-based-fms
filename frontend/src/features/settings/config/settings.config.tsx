import { Folder, Tag, Bell, Key, Shield, Monitor, ShieldCheck, Palette } from 'lucide-react';
import { TabConfig } from '@components/tabs';

export type SettingsTab = 'appearance' | 'categories' | 'tags' | 'reminders' | 'oauth' | 'security' | 'sessions' | 'privacy';

export const getSettingsTabs = (): TabConfig[] => [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: <Palette className="h-5 w-5" />,
  },
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
  {
    id: 'sessions',
    label: 'Sessions',
    icon: <Monitor className="h-5 w-5" />,
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];
