# Groups Module

## Overview
The Groups module enables users to create expense-sharing groups, split bills among members, track balances, and settle debts. Perfect for roommates, trips, events, or any shared expenses.

## Features
- Create and manage expense-sharing groups
- Add/remove group members
- Split expenses (equal, custom, percentage, shares)
- Track member balances
- Settlement suggestions (optimal debt resolution)
- Group budgets
- Activity feed and comments
- Recurring group expenses
- Email invitations
- Role-based permissions (Admin/Member)

## Module Structure

```
groups/
├── groups.module.ts                    # Module definition
├── groups.controller.ts                # REST API endpoints
├── groups.service.ts                   # Business logic
├── group-transactions.service.ts       # Transaction management
├── settlement.service.ts               # Settlement algorithm
├── dto/                                # Data Transfer Objects
│   ├── create-group.dto.ts             # Group creation
│   ├── add-member.dto.ts               # Member addition
│   ├── create-group-transaction.dto.ts # Group expense
│   └── split-expense.dto.ts            # Expense splitting
└── README.md                           # This file
```

## Member Roles
- **ADMIN** - Can manage group, members, and settings
- **MEMBER** - Can add expenses and view group data

## Split Methods
- **EQUAL** - Split amount equally among members
- **CUSTOM** - Specify exact amount per member
- **PERCENTAGE** - Split by percentage
- **SHARES** - Split by shares/parts

## API Endpoints

### GET /api/groups
Get all groups for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Roommates Apartment",
    "description": "Shared apartment expenses",
    "currency": "USD",
    "members": [
      {
        "userId": "uuid",
        "name": "John Doe",
        "role": "ADMIN",
        "balance": -150.00
      },
      {
        "userId": "uuid2",
        "name": "Jane Smith",
        "role": "MEMBER",
        "balance": 150.00
      }
    ],
    "totalBalance": 0.00,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/groups
Create a new group.

**Request Body:**
```json
{
  "name": "Weekend Trip",
  "description": "Miami Beach Trip 2025",
  "currency": "USD"
}
```

### GET /api/groups/:id
Get group details.

**Response:**
```json
{
  "id": "uuid",
  "name": "Weekend Trip",
  "description": "Miami Beach Trip 2025",
  "currency": "USD",
  "createdBy": {
    "id": "uuid",
    "name": "John Doe"
  },
  "members": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "balance": -250.00,
      "totalPaid": 500.00,
      "totalOwed": 750.00
    },
    {
      "userId": "uuid2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "MEMBER",
      "balance": 250.00,
      "totalPaid": 0.00,
      "totalOwed": 250.00
    }
  ],
  "stats": {
    "totalExpenses": 1000.00,
    "transactionCount": 15,
    "settledAmount": 200.00
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PATCH /api/groups/:id
Update group details.

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description"
}
```

### DELETE /api/groups/:id
Delete a group (only if no unsettled expenses).

### POST /api/groups/:id/members
Add a member to the group.

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "MEMBER"
}
```

Or invite by email:
```json
{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

### DELETE /api/groups/:id/members/:userId
Remove a member from the group.

### PATCH /api/groups/:id/members/:userId/role
Change member's role.

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

## Group Transactions

### GET /api/groups/:id/transactions
Get all transactions for a group.

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `startDate` - Filter by date range
- `endDate` - Filter by date range

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "description": "Groceries",
      "amount": 150.00,
      "date": "2025-01-15",
      "paidBy": {
        "id": "uuid",
        "name": "John Doe"
      },
      "splitMethod": "EQUAL",
      "splits": [
        {
          "userId": "uuid",
          "amount": 75.00,
          "paid": true
        },
        {
          "userId": "uuid2",
          "amount": 75.00,
          "paid": false
        }
      ],
      "category": "Food",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "lastPage": 2
  }
}
```

### POST /api/groups/:id/transactions
Add an expense to the group.

**Request Body (Equal Split):**
```json
{
  "description": "Dinner at restaurant",
  "amount": 120.00,
  "date": "2025-01-15",
  "paidById": "uuid",
  "splitMethod": "EQUAL",
  "participantIds": ["uuid1", "uuid2", "uuid3"],
  "categoryId": "uuid",
  "notes": "Team dinner"
}
```

**Request Body (Custom Split):**
```json
{
  "description": "Hotel booking",
  "amount": 300.00,
  "date": "2025-01-15",
  "paidById": "uuid",
  "splitMethod": "CUSTOM",
  "splits": [
    {
      "userId": "uuid1",
      "amount": 100.00
    },
    {
      "userId": "uuid2",
      "amount": 200.00
    }
  ],
  "categoryId": "uuid"
}
```

**Request Body (Percentage Split):**
```json
{
  "description": "Car rental",
  "amount": 200.00,
  "date": "2025-01-15",
  "paidById": "uuid",
  "splitMethod": "PERCENTAGE",
  "splits": [
    {
      "userId": "uuid1",
      "percentage": 60
    },
    {
      "userId": "uuid2",
      "percentage": 40
    }
  ]
}
```

### GET /api/groups/:id/balances
Get current balances for all members.

**Response:**
```json
{
  "balances": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "balance": -250.00,
      "totalPaid": 500.00,
      "totalOwed": 750.00,
      "status": "OWES"
    },
    {
      "userId": "uuid2",
      "name": "Jane Smith",
      "balance": 125.00,
      "totalPaid": 375.00,
      "totalOwed": 250.00,
      "status": "GETS_BACK"
    },
    {
      "userId": "uuid3",
      "name": "Bob Wilson",
      "balance": 125.00,
      "totalPaid": 125.00,
      "totalOwed": 0.00,
      "status": "GETS_BACK"
    }
  ],
  "totalExpenses": 1000.00,
  "settled": false
}
```

### GET /api/groups/:id/settlements
Get settlement suggestions (optimal debt resolution).

**Response:**
```json
{
  "settlements": [
    {
      "from": {
        "id": "uuid",
        "name": "John Doe"
      },
      "to": {
        "id": "uuid2",
        "name": "Jane Smith"
      },
      "amount": 125.00
    },
    {
      "from": {
        "id": "uuid",
        "name": "John Doe"
      },
      "to": {
        "id": "uuid3",
        "name": "Bob Wilson"
      },
      "amount": 125.00
    }
  ],
  "totalTransactions": 2,
  "message": "John Doe owes $125 to Jane Smith and $125 to Bob Wilson to settle all debts"
}
```

### POST /api/groups/:id/settle
Record a settlement payment.

**Request Body:**
```json
{
  "fromUserId": "uuid",
  "toUserId": "uuid2",
  "amount": 125.00,
  "paymentMethod": "Cash",
  "notes": "Paid via Venmo"
}
```

## Group Comments & Activity

### GET /api/groups/:id/comments
Get group activity feed.

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "name": "John Doe"
    },
    "message": "Added $150 expense for groceries",
    "type": "EXPENSE",
    "createdAt": "2025-01-15T10:00:00Z"
  },
  {
    "id": "uuid2",
    "user": {
      "id": "uuid2",
      "name": "Jane Smith"
    },
    "message": "Paid John $125",
    "type": "SETTLEMENT",
    "createdAt": "2025-01-15T11:00:00Z"
  }
]
```

### POST /api/groups/:id/comments
Add a comment to the group.

**Request Body:**
```json
{
  "message": "Don't forget to split the uber costs!"
}
```

## Group Budgets

### GET /api/groups/:id/budgets
Get group budgets.

### POST /api/groups/:id/budgets
Create a group budget.

**Request Body:**
```json
{
  "categoryId": "uuid",
  "amount": 500.00,
  "period": "MONTHLY"
}
```

## Database Entities

### Groups Table
**Table:** `groups`

**Fields:**
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT, nullable)
- `currency` (VARCHAR, default: 'USD')
- `createdById` (UUID, Foreign Key → users.id)
- `isActive` (BOOLEAN, default: true)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Group Members Table
**Table:** `group_members`

**Fields:**
- `id` (UUID, Primary Key)
- `groupId` (UUID, Foreign Key → groups.id)
- `userId` (UUID, Foreign Key → users.id)
- `role` (ENUM: ADMIN, MEMBER)
- `joinedAt` (TIMESTAMP)

**Unique Index:** (groupId, userId)

### Group Transactions Table
**Table:** `group_transactions`

**Fields:**
- `id` (UUID, Primary Key)
- `groupId` (UUID, Foreign Key → groups.id)
- `description` (VARCHAR)
- `amount` (DECIMAL)
- `date` (DATE)
- `paidById` (UUID, Foreign Key → users.id)
- `splitMethod` (ENUM: EQUAL, CUSTOM, PERCENTAGE, SHARES)
- `categoryId` (UUID, Foreign Key → categories.id, nullable)
- `notes` (TEXT, nullable)
- `createdAt` (TIMESTAMP)

### Group Transaction Splits Table
**Table:** `group_transaction_splits`

**Fields:**
- `id` (UUID, Primary Key)
- `transactionId` (UUID, Foreign Key → group_transactions.id)
- `userId` (UUID, Foreign Key → users.id)
- `amount` (DECIMAL)
- `percentage` (DECIMAL, nullable)
- `shares` (INTEGER, nullable)
- `isPaid` (BOOLEAN, default: false)

## Settlement Algorithm

The system uses a **greedy algorithm** to minimize the number of transactions:

```typescript
function calculateSettlements(balances) {
  const creditors = balances.filter(b => b.balance > 0); // Gets back money
  const debtors = balances.filter(b => b.balance < 0);   // Owes money

  const settlements = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    const amount = Math.min(
      Math.abs(debtor.balance),
      creditor.balance
    );

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) debtors.shift();
    if (creditor.balance === 0) creditors.shift();
  }

  return settlements;
}
```

**Example:**
- Alice: -$150 (owes)
- Bob: +$100 (gets back)
- Charlie: +$50 (gets back)

**Optimal settlement:**
1. Alice pays Bob $100
2. Alice pays Charlie $50

Total: 2 transactions (instead of many individual payments)

## Business Logic

### Balance Calculation
```typescript
userBalance = totalPaid - totalOwed

// Positive balance: User gets money back
// Negative balance: User owes money
// Zero balance: User is settled
```

### Split Methods

**Equal Split:**
```typescript
amountPerPerson = totalAmount / numberOfParticipants
```

**Custom Split:**
```typescript
// User specifies exact amounts
// Validation: sum of splits must equal total amount
```

**Percentage Split:**
```typescript
userAmount = (totalAmount * userPercentage) / 100
// Validation: sum of percentages must equal 100
```

**Shares Split:**
```typescript
totalShares = sum of all shares
userAmount = (totalAmount * userShares) / totalShares
```

## Validation Rules
- Group name required (3-100 characters)
- Must have at least 2 members
- User can only be in a group once
- Only ADMIN can add/remove members
- Only ADMIN can delete group
- Cannot delete group with unsettled balances
- Split amounts must equal transaction total
- Cannot remove yourself if you're the last admin

## Security & Permissions
- Users can only access groups they're members of
- Only ADMIN can:
  - Update group details
  - Add/remove members
  - Change member roles
  - Delete group
- All members can:
  - Add expenses
  - View balances
  - Record settlements
  - Add comments

## WebSocket Events
```typescript
// Real-time group updates
socket.on('group.expense.added', (data) => {
  // New expense added
});

socket.on('group.settlement', (data) => {
  // Settlement recorded
});

socket.on('group.member.added', (data) => {
  // New member joined
});
```

## Performance Optimizations
- Balance calculations cached (Redis, TTL: 300s)
- Settlement algorithm optimized for large groups
- Pagination for transaction history
- Indexes on groupId, userId, date

## Testing
```bash
npm run test -- groups
```

## Usage Examples

### Create a Trip Group
```typescript
POST /api/groups
{
  "name": "Europe Trip 2025",
  "description": "3-week backpacking trip",
  "currency": "EUR"
}
```

### Add an Expense
```typescript
POST /api/groups/group-id/transactions
{
  "description": "Hotel in Paris",
  "amount": 300.00,
  "date": "2025-01-15",
  "paidById": "john-id",
  "splitMethod": "EQUAL",
  "participantIds": ["john-id", "jane-id", "bob-id"]
}

// Each person owes: 300 / 3 = 100
// John paid 300, owes 100 → balance: +200
// Jane paid 0, owes 100 → balance: -100
// Bob paid 0, owes 100 → balance: -100
```

### Get Settlement Plan
```typescript
GET /api/groups/group-id/settlements

Response:
{
  "settlements": [
    { "from": "jane-id", "to": "john-id", "amount": 100 },
    { "from": "bob-id", "to": "john-id", "amount": 100 }
  ]
}
```

### Record Settlement
```typescript
POST /api/groups/group-id/settle
{
  "fromUserId": "jane-id",
  "toUserId": "john-id",
  "amount": 100.00,
  "notes": "Paid via Venmo"
}
```

## Best Practices
1. Add expenses as they occur for accuracy
2. Use clear, descriptive names for expenses
3. Review settlements before group trip ends
4. Record settlements immediately after payment
5. Use group comments to communicate
6. Assign multiple admins for important groups
7. Set group budgets for better planning
8. Export group data for tax purposes

## Related Modules
- **Transactions** - Group expenses can sync to personal transactions
- **Categories** - Categorize group expenses
- **Budgets** - Group budgets
- **Notifications** - Group activity notifications
- **Export** - Export group expense reports

## Error Handling
- `404 NOT_FOUND` - Group not found
- `403 FORBIDDEN` - User not in group or insufficient permissions
- `400 BAD_REQUEST` - Invalid split or validation error
- `409 CONFLICT` - Cannot delete group with balances

## Future Enhancements
- Multi-currency support with exchange rates
- Recurring group expenses
- Split by percentage of income
- Group expense templates
- Receipt attachments
- Payment integration (Venmo, PayPal)
- Group expense analytics
