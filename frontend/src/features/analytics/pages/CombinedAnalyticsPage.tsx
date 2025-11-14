import { useState } from 'react';
import { Tabs } from '@components/tabs';
import { ErrorBoundary } from '@/components/error-boundary';
import { BarChart3, Lightbulb, FileText } from 'lucide-react';
import AnalyticsPage from './AnalyticsPage';
import InsightsDashboardPage from '@features/insights/pages/InsightsDashboardPage';
import ReportsPage from '@features/reports/pages/ReportsPage';

type AnalyticsTab = 'analytics' | 'insights' | 'reports';

export default function CombinedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('analytics');

  const tabs = [
    {
      id: 'analytics' as AnalyticsTab,
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: 'insights' as AnalyticsTab,
      label: 'Insights',
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      id: 'reports' as AnalyticsTab,
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as AnalyticsTab);
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

      {/* Tab Content */}
      <div className="rounded-lg bg-card transition-colors">
        <ErrorBoundary level="component">
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'insights' && <InsightsDashboardPage />}
          {activeTab === 'reports' && <ReportsPage />}
        </ErrorBoundary>
      </div>
    </div>
  );
}
