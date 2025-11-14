import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi, budgetsApi, investmentsApi, groupsApi, analyticsApi } from '@services/api';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header with staggered animation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in-down">
        <div className="min-w-0 space-y-2">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-gradient">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex gap-3 items-center flex-shrink-0 animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
          <DashboardCustomizer
            isCustomizing={isCustomizing}
            onToggleCustomizing={() => setIsCustomizing(!isCustomizing)}
          />
        </div>
      </div>

      {/* Customizable Widget Grid with staggered animations */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div
            className={`grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            {visibleWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s`, animationFillMode: 'backwards' }}
              >
                <WidgetWrapper
                  widget={widget}
                  isCustomizing={isCustomizing}
                  onRemove={() => removeWidget(widget.id)}
                  onConfigure={() => setConfigWidget(widget)}
                  onToggleVisibility={() => toggleWidgetVisibility(widget.id)}
                >
                  {renderWidget(widget)}
                </WidgetWrapper>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State with modern styling */}
      {visibleWidgets.length === 0 && (
        <div className="text-center py-20 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-border animate-scale-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <Wallet className="relative h-16 w-16 text-primary mx-auto mb-4 animate-float" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground mb-2">No Widgets Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click "Customize Dashboard" to add widgets and personalize your financial view.
          </p>
          <button
            onClick={() => setIsCustomizing(true)}
            className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-medium shadow-glow-sm hover:shadow-glow-md transition-all duration-200 active:scale-95"
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
