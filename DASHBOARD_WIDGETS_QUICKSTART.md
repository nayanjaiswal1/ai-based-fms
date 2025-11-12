# Custom Dashboard Widgets - Quick Start Guide

## Setup Instructions

### 1. Install Dependencies (Already Completed)
```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Run Database Migration
```bash
cd backend

# Start your database first
# Then run the migration:
npm run migration:run
```

### 3. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access the Dashboard
1. Navigate to `http://localhost:5173` (or your frontend URL)
2. Log in to your account
3. Go to the Dashboard page
4. Click "Customize Dashboard" button

---

## Using the Dashboard Widgets

### Customization Mode

**Enter Customization Mode:**
- Click the "Customize Dashboard" button in the top-right corner

**In Customization Mode, you can:**

1. **Drag to Reorder**
   - Click and hold the grip icon (⋮⋮) on any widget
   - Drag to a new position
   - Release to drop

2. **Show/Hide Widgets**
   - Click the eye icon to toggle visibility
   - Hidden widgets remain in your layout but aren't displayed

3. **Configure Widgets**
   - Click the gear icon to open configuration
   - Change widget size (Small, Medium, Large, Full-width)
   - Set custom title
   - Adjust date ranges
   - Set auto-refresh intervals

4. **Remove Widgets**
   - Click the X icon to remove a widget
   - Can be re-added from the Widget Gallery

5. **Add New Widgets**
   - Click "Add Widget" in the bottom toolbar
   - Browse or search for widgets
   - Filter by category (Financial, Budgets, Analytics, Goals, Investments)
   - Click "Add Widget" on any widget card

6. **Reset to Default**
   - Click "Reset to Default" to restore original layout
   - Confirmation required

7. **Save Changes**
   - Click "Done" to exit customization mode
   - Changes are automatically saved

---

## Available Widgets

### Financial Category
- **Total Balance** - Overview of all account balances
- **Income & Expenses** - Monthly income and expense summary
- **Account Balances** - Detailed view of all accounts with quick access
- **Savings Rate Tracker** - Visual circular tracker showing savings percentage
- **Upcoming Bills** - Bills and payments due soon with overdue alerts

### Budgets Category
- **Budget Overview** - Budget progress with visual bars
- **Budget Progress** - Detailed budget tracking with alerts

### Analytics Category
- **Spending by Category** - Pie chart of expense breakdown
- **Top Spending Categories** - Bar chart of highest expense categories
- **Monthly Trend** - Line chart of income/expense trends
- **Financial Health Score** - Overall financial health metrics (0-100)
- **Cash Flow Chart** - Area chart of monthly cash flow
- **Net Worth Tracker** - Line chart tracking net worth over time

### Investments Category
- **Investment Performance** - Portfolio performance with ROI
- **Investments Summary** - Quick investment portfolio overview

### Goals Category
- **Goal Progress** - Track financial goals with progress bars

### Transactions Category
- **Recent Transactions** - Latest 5 transactions with quick view

---

## Widget Sizes Explained

**Small (1 column)**
- Best for: Quick stats, single metrics
- Examples: Total Balance card

**Medium (1 column on mobile, 1 on tablet/desktop)**
- Best for: Lists, charts, detailed views
- Examples: Account Balances, Savings Rate

**Large (1 column on mobile, 2 on desktop)**
- Best for: Tables, detailed lists
- Examples: Recent Transactions, Budget Overview

**Full-width (spans all columns)**
- Best for: Wide charts, comprehensive views
- Examples: Monthly Trend, Cash Flow Chart

---

## Tips & Best Practices

1. **Start Simple**
   - Begin with 6-8 widgets
   - Add more as needed

2. **Organize by Priority**
   - Place most important widgets at the top
   - Less frequently used widgets below

3. **Use Categories**
   - Group similar widgets together
   - Financial widgets in one area, analytics in another

4. **Mobile Consideration**
   - Test your layout on mobile
   - All widgets stack vertically on mobile

5. **Performance**
   - Too many widgets (20+) may slow down the page
   - Hide unused widgets instead of removing them

6. **Regular Reviews**
   - Periodically review your layout
   - Remove widgets you don't use
   - Add new widgets as your needs change

---

## Keyboard Shortcuts (Future Enhancement)

While not currently implemented, these shortcuts are planned:
- `Ctrl + E` - Toggle customization mode
- `Ctrl + A` - Add widget
- `Ctrl + R` - Reset to default
- `Escape` - Exit customization mode

---

## Troubleshooting

### Widgets Not Showing
1. Check if widgets are visible (eye icon in customization mode)
2. Verify data is available for the widget
3. Check browser console for errors

### Drag-and-Drop Not Working
1. Ensure you're in customization mode
2. Click and hold the grip icon (⋮⋮)
3. Try dragging with a mouse instead of trackpad
4. Clear browser cache and reload

### Changes Not Saving
1. Check internet connection
2. Verify you're logged in
3. Check browser console for API errors
4. Try logging out and back in

### Layout Looks Wrong
1. Click "Reset to Default" to restore
2. Clear localStorage: `localStorage.clear()`
3. Refresh the page

### Migration Issues
```bash
# Check migration status
npm run typeorm migration:show

# Revert last migration
npm run migration:revert

# Run migrations again
npm run migration:run
```

---

## API Endpoints

### Get Preferences
```bash
GET /dashboard/preferences
Authorization: Bearer <token>
```

### Update Preferences
```bash
PUT /dashboard/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "widgets": [
    {
      "id": "widget-id",
      "type": "account-balances",
      "position": 0,
      "size": "medium",
      "visible": true,
      "config": {
        "title": "My Accounts",
        "refreshInterval": 60
      }
    }
  ],
  "gridColumns": 3
}
```

### Reset to Default
```bash
POST /dashboard/preferences/reset
Authorization: Bearer <token>
```

---

## Support

For issues or questions:
1. Check the main implementation documentation: `DASHBOARD_WIDGETS_IMPLEMENTATION.md`
2. Review the code comments in the widget components
3. Check the browser console for errors
4. Review the backend logs for API errors

---

## What's Next?

After setting up the dashboard widgets, consider:
1. Creating additional custom widgets for your specific needs
2. Implementing the TODO data sources (bills, goals, cash flow APIs)
3. Adding more advanced filtering options
4. Implementing widget templates for quick setup
5. Adding export functionality for widget configurations

---

## File Structure Reference

```
frontend/src/features/dashboard/
├── api/
│   └── dashboard-preferences.api.ts       # API client
├── components/
│   ├── widgets/                           # Widget components
│   │   ├── AccountBalancesWidget.tsx
│   │   ├── TopSpendingWidget.tsx
│   │   ├── SavingsRateWidget.tsx
│   │   ├── FinancialHealthWidget.tsx
│   │   ├── UpcomingBillsWidget.tsx
│   │   ├── InvestmentPerformanceWidget.tsx
│   │   ├── GoalProgressWidget.tsx
│   │   ├── CashFlowWidget.tsx
│   │   └── NetWorthTrackerWidget.tsx
│   ├── DashboardCustomizer.tsx            # Customization toolbar
│   ├── WidgetGallery.tsx                  # Widget selection modal
│   ├── WidgetConfigModal.tsx              # Widget settings modal
│   └── WidgetWrapper.tsx                  # Drag-and-drop wrapper
├── config/
│   └── widgetRegistry.ts                  # Widget definitions
├── hooks/
│   ├── useWidgetPreferences.ts            # Preferences hook
│   └── useDashboardLayout.ts              # Layout hook
└── pages/
    └── DashboardPage.tsx                  # Main dashboard page

backend/src/
├── database/
│   ├── entities/
│   │   └── user-dashboard-preference.entity.ts
│   └── migrations/
│       └── 1731412800000-CreateDashboardPreferences.ts
└── modules/
    └── dashboard-preferences/
        ├── dashboard-preferences.module.ts
        ├── dashboard-preferences.service.ts
        ├── dashboard-preferences.controller.ts
        └── dto/
            └── update-preferences.dto.ts
```

Enjoy your customizable dashboard!
