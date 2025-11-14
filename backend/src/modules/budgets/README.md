# Budgets Module

## Overview
The Budgets module enables users to set spending limits for categories and track their progress in real-time. It provides alerts when spending approaches or exceeds budget limits.

## Features
- Create monthly/yearly budgets per category
- Real-time budget progress tracking
- Alert thresholds (warning at 80%, danger at 90%)
- Budget rollover options
- Historical budget comparison
- WebSocket notifications for budget updates
- Multi-currency support

## Module Structure

```
budgets/
├── budgets.module.ts           # Module definition
├── budgets.controller.ts       # REST API endpoints
├── budgets.service.ts          # Business logic
├── dto/                        # Data Transfer Objects
│   ├── create-budget.dto.ts    # Budget creation validation
│   ├── update-budget.dto.ts    # Budget update validation
│   └── budget-alert.dto.ts     # Alert configuration
└── README.md                   # This file
```

## Budget Periods
- **MONTHLY** - Resets every month
- **YEARLY** - Resets every year
- **CUSTOM** - User-defined period

## API Endpoints

### GET /api/budgets
Get all budgets for the authenticated user.

**Query Parameters:**
- `period` (optional) - Filter by period type
- `categoryId` (optional) - Filter by category
- `status` (optional) - Filter by status (active/exceeded/near_limit)

**Response:**
```json
[
  {
    "id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Food & Dining"
    },
    "amount": 500.00,
    "spent": 380.00,
    "remaining": 120.00,
    "period": "MONTHLY",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "alertThreshold": 80,
    "status": "ACTIVE",
    "percentageUsed": 76.0
  }
]
```

### POST /api/budgets
Create a new budget.

**Request Body:**
```json
{
  "categoryId": "uuid",
  "amount": 600.00,
  "period": "MONTHLY",
  "startDate": "2025-01-01",
  "alertThreshold": 85,
  "rollover": false
}
```

### GET /api/budgets/:id
Get budget details with full spending breakdown.

**Response:**
```json
{
  "id": "uuid",
  "category": {
    "id": "uuid",
    "name": "Food & Dining"
  },
  "amount": 500.00,
  "spent": 380.00,
  "remaining": 120.00,
  "period": "MONTHLY",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "alertThreshold": 80,
  "status": "ACTIVE",
  "percentageUsed": 76.0,
  "transactions": [
    {
      "id": "uuid",
      "amount": 50.00,
      "description": "Grocery store",
      "date": "2025-01-10"
    }
  ],
  "history": [
    {
      "period": "2024-12",
      "budgeted": 500.00,
      "spent": 520.00,
      "variance": -20.00
    }
  ]
}
```

### PATCH /api/budgets/:id
Update budget settings.

**Request Body:**
```json
{
  "amount": 650.00,
  "alertThreshold": 90
}
```

### DELETE /api/budgets/:id
Delete a budget.

### GET /api/budgets/:id/progress
Get real-time budget progress.

**Response:**
```json
{
  "budgetId": "uuid",
  "amount": 500.00,
  "spent": 380.00,
  "remaining": 120.00,
  "percentageUsed": 76.0,
  "status": "ACTIVE",
  "daysRemaining": 15,
  "averageDailySpending": 12.67,
  "projectedTotal": 507.33,
  "isOnTrack": false
}
```

### GET /api/budgets/alerts
Get active budget alerts.

**Response:**
```json
[
  {
    "budgetId": "uuid",
    "category": "Food & Dining",
    "type": "WARNING",
    "message": "You've used 85% of your Food & Dining budget",
    "spent": 425.00,
    "limit": 500.00,
    "percentageUsed": 85.0
  }
]
```

### GET /api/budgets/summary
Get budget summary for current period.

**Response:**
```json
{
  "totalBudgeted": 2000.00,
  "totalSpent": 1450.00,
  "totalRemaining": 550.00,
  "percentageUsed": 72.5,
  "budgetsExceeded": 2,
  "budgetsNearLimit": 3,
  "budgetsOnTrack": 5
}
```

## Database Entity

**Table:** `budgets`

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → users.id)
- `categoryId` (UUID, Foreign Key → categories.id)
- `amount` (DECIMAL)
- `period` (ENUM: MONTHLY, YEARLY, CUSTOM)
- `startDate` (DATE)
- `endDate` (DATE)
- `alertThreshold` (INTEGER, 0-100, default: 80)
- `rollover` (BOOLEAN, default: false)
- `isActive` (BOOLEAN, default: true)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Relationships:**
- Many-to-One with User
- Many-to-One with Category

## Business Logic

### Budget Calculation
Spent amount is calculated from transactions:
```sql
SELECT SUM(amount)
FROM transactions
WHERE categoryId = budget.categoryId
  AND date BETWEEN budget.startDate AND budget.endDate
  AND type = 'EXPENSE'
```

### Alert System
Alerts are triggered when:
- **Warning (80% default)**: User has spent 80% of budget
- **Danger (90% default)**: User has spent 90% of budget
- **Exceeded (100%)**: User has exceeded budget

Alerts are sent via:
- WebSocket real-time notification
- In-app notification
- Email (if enabled in user settings)

### Budget Status
- **ACTIVE**: Budget is within limits
- **NEAR_LIMIT**: Spending >= alertThreshold
- **EXCEEDED**: Spending > 100%
- **INACTIVE**: Budget period has ended

### Budget Rollover
If rollover is enabled:
- Unused budget from previous period carries over
- New budget amount = original amount + rollover amount
- Rollover is calculated automatically at period end

### Period Management
- Monthly budgets: Auto-renew on 1st of each month
- Yearly budgets: Auto-renew on January 1st
- Custom periods: User specifies start/end dates

## Validation Rules
- Budget amount must be > 0
- Alert threshold must be between 1-100
- Category must exist and belong to user
- Start date must be before end date
- Cannot have duplicate budgets for same category/period
- Maximum 100 active budgets per user

## Security
- Users can only access their own budgets
- JWT authentication required
- Category ownership validated

## WebSocket Events
```typescript
// Client subscribes to budget updates
socket.on('budget.updated', (data) => {
  // data: { budgetId, spent, remaining, status }
});

socket.on('budget.alert', (data) => {
  // data: { budgetId, category, type, message }
});

socket.on('budget.exceeded', (data) => {
  // data: { budgetId, category, overspent }
});
```

## Performance Optimizations
- Budget calculations cached (Redis, TTL: 300s)
- Aggregate queries optimized with indexes
- Background job recalculates budgets daily
- WebSocket events debounced (1 per 5 seconds)

## Related Modules
- **Transactions** - Budget spending comes from transactions
- **Categories** - Budgets are per category
- **Notifications** - Budget alerts create notifications
- **Analytics** - Budget data used in financial analytics
- **Groups** - Group budgets supported

## Error Handling
- `404 NOT_FOUND` - Budget not found
- `403 FORBIDDEN` - User doesn't own the budget
- `400 BAD_REQUEST` - Invalid budget data
- `409 CONFLICT` - Duplicate budget for category/period

## Testing
```bash
npm run test -- budgets
```

## Usage Examples

### Create Monthly Food Budget
```typescript
POST /api/budgets
{
  "categoryId": "food-category-id",
  "amount": 500.00,
  "period": "MONTHLY",
  "startDate": "2025-01-01",
  "alertThreshold": 85,
  "rollover": false
}
```

### Get Budget Progress
```typescript
GET /api/budgets/budget-id/progress

Response:
{
  "spent": 380.00,
  "remaining": 120.00,
  "percentageUsed": 76.0,
  "status": "ACTIVE",
  "daysRemaining": 15,
  "averageDailySpending": 12.67,
  "projectedTotal": 507.33,
  "isOnTrack": false
}
```

### Monitor Budget Alerts
```typescript
// WebSocket connection
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token' }
});

socket.on('budget.alert', (alert) => {
  console.log(`Alert: ${alert.message}`);
  // Display notification to user
});
```

## Best Practices
1. Set realistic budget amounts based on historical spending
2. Use alert thresholds to get early warnings
3. Review budget performance monthly
4. Enable rollover for variable spending categories
5. Create budgets for all major spending categories
6. Monitor WebSocket alerts for real-time awareness
7. Use budget insights to improve spending habits

## Budget Insights
The system provides insights such as:
- **Overspending Trends**: Categories consistently over budget
- **Underspending**: Categories with unused budget
- **Seasonal Patterns**: Categories with seasonal variations
- **Recommendations**: Suggested budget adjustments based on history
