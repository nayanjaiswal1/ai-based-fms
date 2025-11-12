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
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-accent'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
        }`;
      default:
        return `${baseClasses} rounded-t-lg border border-b-0 ${
          isActive
            ? 'bg-background text-primary border-border'
            : 'bg-muted text-muted-foreground border-transparent hover:bg-accent'
        }`;
    }
  };

  return (
    <div className={`flex gap-1 ${variant === 'underline' ? 'border-b border-border' : ''} ${className}`}>
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
                ? 'bg-primary/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
