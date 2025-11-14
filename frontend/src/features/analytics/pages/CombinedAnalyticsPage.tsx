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
      icon: BarChart3,
    },
    {
      id: 'insights' as AnalyticsTab,
      label: 'Insights',
      icon: Lightbulb,
    },
    {
      id: 'reports' as AnalyticsTab,
      label: 'Reports',
      icon: FileText,
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as AnalyticsTab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View analytics, insights, and generate custom reports for your financial data
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
