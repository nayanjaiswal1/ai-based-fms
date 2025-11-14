# Dashboard Feature

## Overview
The Dashboard is the central hub of the Finance Management System, providing users with a customizable, widget-based overview of their financial status.

## Features
- **9 Widget Types** for comprehensive financial overview
- **Drag-and-Drop Customization** - Rearrange widgets
- **Responsive Grid Layout** - Adapts to screen size
- **Widget Configuration** - Customize each widget's settings
- **Real-time Updates** - WebSocket integration for live data
- **Export Snapshot** - Export dashboard as PDF

## Feature Structure

```
dashboard/
├── components/
│   ├── DashboardGrid.tsx           # Main grid layout
│   ├── WidgetContainer.tsx         # Widget wrapper
│   ├── AddWidgetButton.tsx         # Add widget modal
│   └── widgets/                    # Widget components
│       ├── NetWorthWidget.tsx
│       ├── AccountBalancesWidget.tsx
│       ├── BudgetProgressWidget.tsx
│       ├── RecentTransactionsWidget.tsx
│       ├── FinancialHealthWidget.tsx
│       ├── CashFlowWidget.tsx
│       ├── InvestmentPerformanceWidget.tsx
│       ├── SavingsRateWidget.tsx
│       └── UpcomingBillsWidget.tsx
├── pages/
│   └── DashboardPage.tsx           # Main dashboard page
├── hooks/
│   ├── useDashboard.ts            # Dashboard state and logic
│   └── useWidgets.ts              # Widget management
└── README.md                       # This file
```

## Available Widgets

### 1. Net Worth Widget
Displays total net worth with trend indicator.

**Features:**
- Total assets minus liabilities
- Period-over-period change
- Mini chart showing trend
- Clickable to view details

**Data:**
```typescript
{
  currentNetWorth: 45000.00,
  previousNetWorth: 42000.00,
  change: 3000.00,
  changePercentage: 7.14,
  trend: 'up',
  history: [...] // Last 6 months
}
```

### 2. Account Balances Widget
Shows all account balances at a glance.

**Features:**
- List of all accounts with balances
- Color-coded by account type
- Quick add transaction button
- Pie chart of account distribution

**Configuration:**
- Show/hide specific accounts
- Sort order (balance, name, type)
- Display mode (list, chart, both)

### 3. Budget Progress Widget
Displays budget progress for current period.

**Features:**
- Progress bars for each budget
- Warning/danger indicators
- Remaining days in period
- Quick access to budget details

**Configuration:**
- Show all budgets or select specific ones
- Group by category or show flat list
- Alert threshold customization

### 4. Recent Transactions Widget
Lists most recent transactions.

**Features:**
- Last 10 transactions
- Quick edit/delete
- Filter by type
- View all link

**Configuration:**
- Number of transactions to show (5, 10, 20)
- Transaction types to include
- Show/hide attachments

### 5. Financial Health Score Widget
AI-calculated financial health score.

**Features:**
- Score out of 100
- Breakdown by factors:
  - Spending habits (30%)
  - Savings rate (25%)
  - Budget adherence (20%)
  - Debt ratio (15%)
  - Emergency fund (10%)
- Recommendations for improvement

**Updates:** Weekly

### 6. Cash Flow Widget
Visualizes income vs expenses.

**Features:**
- Bar/line chart
- Monthly view (last 6 months)
- Income, expense, and net lines
- Projection for next month

**Configuration:**
- Time period (3, 6, 12 months)
- Chart type (bar, line, area)
- Show/hide projection

### 7. Investment Performance Widget
Shows investment portfolio performance.

**Features:**
- Total portfolio value
- ROI percentage
- Top performing investments
- Asset allocation chart

**Configuration:**
- Show/hide specific investments
- Display mode (summary, detailed)

### 8. Savings Rate Widget
Tracks savings rate over time.

**Features:**
- Current savings rate
- Target savings rate
- Trend over time
- Recommendations to improve

**Formula:**
```
Savings Rate = (Income - Expenses) / Income * 100
```

### 9. Upcoming Bills Widget
Displays upcoming bills and reminders.

**Features:**
- Next 7 days of bills
- Overdue indicator
- Mark as paid
- Add new reminder

**Configuration:**
- Days to look ahead (7, 14, 30)
- Show/hide paid bills

## Usage

### Basic Implementation

```typescript
import { DashboardPage } from '@/features/dashboard';

function App() {
  return <DashboardPage />;
}
```

### Custom Dashboard Layout

```typescript
import { DashboardGrid, useDashboard } from '@/features/dashboard';

function CustomDashboard() {
  const { widgets, addWidget, removeWidget, updateLayout } = useDashboard();

  return (
    <DashboardGrid
      widgets={widgets}
      onLayoutChange={updateLayout}
      onRemoveWidget={removeWidget}
    />
  );
}
```

### Add Widget

```typescript
import { useWidgets } from '@/features/dashboard';

function AddWidgetExample() {
  const { addWidget } = useWidgets();

  const handleAddBudgetWidget = () => {
    addWidget({
      type: 'BUDGET_PROGRESS',
      config: {
        showAllBudgets: true,
        alertThreshold: 80
      }
    });
  };

  return <button onClick={handleAddBudgetWidget}>Add Budget Widget</button>;
}
```

## Widget Configuration

### Widget Configuration Schema

```typescript
interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: {
    // Widget-specific configuration
    [key: string]: any;
  };
}
```

### Example Widget Configs

**Budget Progress Widget:**
```typescript
{
  type: 'BUDGET_PROGRESS',
  config: {
    showAllBudgets: true,
    selectedBudgets: ['uuid1', 'uuid2'],
    groupBy: 'category',
    alertThreshold: 85
  }
}
```

**Cash Flow Widget:**
```typescript
{
  type: 'CASH_FLOW',
  config: {
    period: '6_MONTHS',
    chartType: 'area',
    showProjection: true
  }
}
```

## Dashboard State Management

### Store Structure

```typescript
interface DashboardState {
  widgets: WidgetConfig[];
  layout: Layout[];
  isEditing: boolean;
  addWidget: (config: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void;
  updateLayout: (layout: Layout[]) => void;
  setEditing: (editing: boolean) => void;
  resetToDefault: () => void;
}
```

### Persisting Layout

Dashboard layout is automatically saved to:
1. **Server** - User dashboard preferences
2. **LocalStorage** - Backup for offline access

```typescript
// Auto-save on layout change
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveDashboardPreferences(widgets);
  }, 1000); // Debounce 1 second

  return () => clearTimeout(timeoutId);
}, [widgets]);
```

## Drag-and-Drop

Using `@dnd-kit` for drag-and-drop functionality:

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

function DashboardGrid({ widgets }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      updateLayout(newWidgets);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets}>
        {widgets.map((widget) => (
          <SortableWidget key={widget.id} widget={widget} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

## Responsive Behavior

### Breakpoints

```typescript
const breakpoints = {
  xs: 0,    // Mobile
  sm: 640,  // Large mobile
  md: 768,  // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
  '2xl': 1536 // Extra large
};
```

### Grid Columns by Screen Size

- **Mobile (xs-sm)**: 1 column
- **Tablet (md)**: 2 columns
- **Desktop (lg+)**: 3-4 columns

### Widget Sizing

```typescript
// Default widget sizes (grid units)
const defaultSizes = {
  NET_WORTH: { w: 1, h: 1 },
  ACCOUNT_BALANCES: { w: 1, h: 2 },
  BUDGET_PROGRESS: { w: 2, h: 2 },
  RECENT_TRANSACTIONS: { w: 2, h: 2 },
  FINANCIAL_HEALTH: { w: 1, h: 2 },
  CASH_FLOW: { w: 2, h: 2 },
  INVESTMENT_PERFORMANCE: { w: 1, h: 2 },
  SAVINGS_RATE: { w: 1, h: 1 },
  UPCOMING_BILLS: { w: 1, h: 1 }
};
```

## Real-time Updates

### WebSocket Integration

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function NetWorthWidget() {
  const { data, refetch } = useQuery(['netWorth'], fetchNetWorth);
  const { on } = useWebSocket();

  useEffect(() => {
    // Listen for balance updates
    on('balance.updated', () => {
      refetch(); // Refresh net worth
    });

    on('transaction.created', () => {
      refetch(); // Refresh on new transaction
    });
  }, [on, refetch]);

  return <div>{/* Widget UI */}</div>;
}
```

### Auto-refresh Intervals

Different widgets refresh at different intervals:

- **Net Worth**: On transaction/balance change
- **Account Balances**: On balance change
- **Budget Progress**: On transaction change
- **Recent Transactions**: Real-time via WebSocket
- **Financial Health**: Daily calculation
- **Cash Flow**: On transaction change
- **Investment Performance**: Daily update
- **Savings Rate**: On transaction change
- **Upcoming Bills**: On reminder change

## Performance Optimizations

### Lazy Loading Widgets

```typescript
const NetWorthWidget = lazy(() => import('./widgets/NetWorthWidget'));
const BudgetProgressWidget = lazy(() => import('./widgets/BudgetProgressWidget'));

function DashboardGrid({ widgets }) {
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      {widgets.map((widget) => (
        <WidgetContainer key={widget.id} config={widget}>
          {renderWidget(widget.type)}
        </WidgetContainer>
      ))}
    </Suspense>
  );
}
```

### Memoization

```typescript
const MemoizedWidget = memo(NetWorthWidget, (prev, next) => {
  return prev.data === next.data && prev.config === next.config;
});
```

### Query Caching

```typescript
// Cache widget data for 5 minutes
const { data } = useQuery(['netWorth'], fetchNetWorth, {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
});
```

## Accessibility

### Keyboard Navigation
- Tab through widgets
- Arrow keys to rearrange (in edit mode)
- Enter/Space to configure widget
- Delete to remove widget

### Screen Reader Support
```typescript
<div
  role="region"
  aria-label="Net Worth Widget"
  aria-describedby="networth-desc"
>
  <span id="networth-desc" className="sr-only">
    Your current net worth is $45,000, up 7.14% from last month
  </span>
  {/* Widget content */}
</div>
```

### Focus Management
```typescript
// Focus first widget on page load
useEffect(() => {
  const firstWidget = document.querySelector('[data-widget]');
  firstWidget?.focus();
}, []);
```

## Testing

### Widget Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { NetWorthWidget } from './NetWorthWidget';

describe('NetWorthWidget', () => {
  it('displays net worth correctly', () => {
    render(<NetWorthWidget data={{ netWorth: 45000 }} />);
    expect(screen.getByText('$45,000')).toBeInTheDocument();
  });

  it('shows trend indicator', () => {
    render(<NetWorthWidget data={{ change: 3000 }} />);
    expect(screen.getByText('↑ 7.14%')).toBeInTheDocument();
  });
});
```

### Dashboard Integration Test

```typescript
describe('DashboardPage', () => {
  it('loads user widgets on mount', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Net Worth')).toBeInTheDocument();
    });
  });

  it('allows adding new widgets', async () => {
    render(<DashboardPage />);
    const addButton = screen.getByText('Add Widget');
    fireEvent.click(addButton);
    // ... test widget addition
  });
});
```

## API Integration

### Fetch Dashboard Data

```typescript
GET /api/dashboard-preferences

Response:
{
  widgets: [
    {
      id: 'uuid',
      type: 'NET_WORTH',
      position: { x: 0, y: 0, w: 1, h: 1 },
      config: {}
    }
  ]
}
```

### Save Dashboard Layout

```typescript
PATCH /api/dashboard-preferences

Request:
{
  widgets: [...]
}
```

### Reset to Default

```typescript
POST /api/dashboard-preferences/reset
```

## Best Practices

1. **Keep widgets focused** - Each widget should display one key metric
2. **Use consistent styling** - Follow design system for uniform look
3. **Optimize data fetching** - Cache and batch requests
4. **Provide configuration** - Let users customize widget behavior
5. **Handle errors gracefully** - Show fallback UI on errors
6. **Make it accessible** - Support keyboard and screen readers
7. **Update in real-time** - Use WebSocket for live updates
8. **Mobile-first design** - Ensure widgets work on small screens

## Related Features
- [Analytics](../analytics/README.md) - Detailed analytics
- [Accounts](../accounts/README.md) - Account management
- [Budgets](../budgets/README.md) - Budget tracking
- [Transactions](../transactions/README.md) - Transaction list
- [Investments](../investments/README.md) - Investment tracking

## Future Enhancements
- Custom widget creation
- Widget marketplace
- Data export per widget
- Widget templates
- Collaborative dashboards
- Mobile widget app
