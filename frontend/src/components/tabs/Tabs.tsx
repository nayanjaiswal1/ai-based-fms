import { ReactNode } from 'react';

export interface TabConfig {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, variant = 'default', className = '' }: TabsProps) {
  const getTabClasses = (tab: TabConfig) => {
    const isActive = activeTab === tab.id;
    const baseClasses = 'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors';

    if (tab.disabled) {
      return `${baseClasses} cursor-not-allowed opacity-50`;
    }

    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
        }`;
      default:
        return `${baseClasses} rounded-t-lg border border-b-0 ${
          isActive
            ? 'bg-white text-blue-600 border-gray-300'
            : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
        }`;
    }
  };

  return (
    <div className={`flex gap-1 ${variant === 'underline' ? 'border-b border-gray-200' : ''} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={getTabClasses(tab)}
          disabled={tab.disabled}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
