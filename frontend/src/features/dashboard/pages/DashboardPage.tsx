import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi, budgetsApi, investmentsApi, groupsApi, analyticsApi, exportApi } from '@services/api';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ExportButton, ExportFormat } from '@/components/export';
import { toast } from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

// Hooks
import { useWidgetPreferences } from '../hooks/useWidgetPreferences';
import { useDashboardLayout } from '../hooks/useDashboardLayout';

// Components
import { DashboardCustomizer } from '../components/DashboardCustomizer';
import { WidgetWrapper } from '../components/WidgetWrapper';
import { WidgetConfigModal } from '../components/WidgetConfigModal';
import { getWidgetDefinition } from '../config/widgetRegistry';
import { WidgetConfig } from '../api/dashboard-preferences.api';

// Widget Components
import { AccountBalancesWidget } from '../components/widgets/AccountBalancesWidget';
import { TopSpendingWidget } from '../components/widgets/TopSpendingWidget';
import { SavingsRateWidget } from '../components/widgets/SavingsRateWidget';
import { FinancialHealthWidget } from '../components/widgets/FinancialHealthWidget';
import { UpcomingBillsWidget } from '../components/widgets/UpcomingBillsWidget';
import { InvestmentPerformanceWidget } from '../components/widgets/InvestmentPerformanceWidget';
import { GoalProgressWidget } from '../components/widgets/GoalProgressWidget';
import { CashFlowWidget } from '../components/widgets/CashFlowWidget';
import { NetWorthTrackerWidget } from '../components/widgets/NetWorthTrackerWidget';
import { StatCards } from '../components/StatCards';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { BudgetProgressWidget } from '../components/BudgetProgressWidget';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [configWidget, setConfigWidget] = useState<WidgetConfig | null>(null);

  const { removeWidget, toggleWidgetVisibility } = useWidgetPreferences();
  const { visibleWidgets, isDragging, handleDragStart, handleDragEnd, handleDragCancel } = useDashboardLayout();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Data queries
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['transaction-stats', format(new Date(), 'yyyy-MM')],
    queryFn: () =>
      transactionsApi.getStats(
        format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      ),
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionsApi.getAll({ limit: 5 }),
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: investmentsApi.getPortfolio,
  });

  const { data: netWorth } = useQuery({
    queryKey: ['net-worth'],
    queryFn: analyticsApi.getNetWorth,
  });

  const handleExport = async (format: ExportFormat) => {
    try {
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const exportFilters = {
        startDate,
        endDate,
        includeCharts: format === 'pdf',
      };

      let response;
      if (format === 'pdf') {
        response = await exportApi.exportAnalyticsPDF(exportFilters);
      }

      if (response) {
        const blob = new Blob([response as any], {
          type: 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Dashboard report exported successfully!');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export dashboard report');
    }
  };

  // Prepare widget data
  const widgetData = {
    accounts: accounts?.data || [],
    stats: stats?.data || {},
    transactions: recentTransactions?.data || [],
    budgets: budgets?.data || [],
    portfolio: portfolio?.data || {},
    netWorth: netWorth?.data || [],
    categoryStats: [], // TODO: Add category stats API
    healthMetrics: {
      score: 75,
      savingsRate: stats?.data?.savings ? (stats.data.savings / (stats.data.income || 1)) * 100 : 0,
      debtToIncomeRatio: 20,
      emergencyFundMonths: 3.5,
      budgetAdherence: 85,
    },
    bills: [], // TODO: Add bills API
    goals: [], // TODO: Add goals API
    cashFlow: [], // TODO: Add cash flow API
  };

  // Render widget based on type
  const renderWidget = (widget: WidgetConfig) => {
    const definition = getWidgetDefinition(widget.type);
    if (!definition) return null;

    const props = {
      config: widget.config,
    };

    switch (widget.type) {
      case 'account-balances':
        return <AccountBalancesWidget accounts={widgetData.accounts} {...props} />;
      case 'top-spending':
        return <TopSpendingWidget data={widgetData.categoryStats} {...props} />;
      case 'savings-rate':
        return (
          <SavingsRateWidget
            income={widgetData.stats.income}
            expenses={widgetData.stats.expense}
            savings={widgetData.stats.savings}
            {...props}
          />
        );
      case 'financial-health':
        return <FinancialHealthWidget metrics={widgetData.healthMetrics} {...props} />;
      case 'upcoming-bills':
        return <UpcomingBillsWidget bills={widgetData.bills} {...props} />;
      case 'investment-performance':
        return <InvestmentPerformanceWidget data={widgetData.portfolio} {...props} />;
      case 'goal-progress':
        return <GoalProgressWidget goals={widgetData.goals} {...props} />;
      case 'cash-flow':
        return <CashFlowWidget data={widgetData.cashFlow} {...props} />;
      case 'net-worth':
        return <NetWorthTrackerWidget data={widgetData.netWorth} {...props} />;
      case 'recent-transactions':
        return (
          <RecentTransactionsWidget
            transactions={widgetData.transactions}
            onViewAll={() => navigate('/transactions')}
          />
        );
      case 'budget-overview':
        return (
          <BudgetProgressWidget
            budgets={widgetData.budgets}
            onViewAll={() => navigate('/budgets')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0">
          <DashboardCustomizer
            isCustomizing={isCustomizing}
            onToggleCustomizing={() => setIsCustomizing(!isCustomizing)}
          />
          <ExportButton
            entityType="analytics"
            onExport={handleExport}
            formats={['pdf']}
            variant="button"
            label="Export Report"
          />
        </div>
      </div>

      {/* Customizable Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div
            className={`grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            {visibleWidgets.map((widget) => (
              <WidgetWrapper
                key={widget.id}
                widget={widget}
                isCustomizing={isCustomizing}
                onRemove={() => removeWidget(widget.id)}
                onConfigure={() => setConfigWidget(widget)}
                onToggleVisibility={() => toggleWidgetVisibility(widget.id)}
              >
                {renderWidget(widget)}
              </WidgetWrapper>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Widgets</h3>
          <p className="text-gray-600 mb-4">
            Click "Customize Dashboard" to add widgets and personalize your view.
          </p>
          <button
            onClick={() => setIsCustomizing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Customize Dashboard
          </button>
        </div>
      )}

      {/* Widget Config Modal */}
      <WidgetConfigModal
        widget={configWidget}
        isOpen={!!configWidget}
        onClose={() => setConfigWidget(null)}
      />
    </div>
  );
}
