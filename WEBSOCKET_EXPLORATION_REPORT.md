# WebSocket Implementation Exploration Report
## Finance Management System - Real-Time Collaboration Analysis

**Date**: November 12, 2025
**Codebase Size**: 191 backend TS files | 246 frontend TS/TSX files
**Project Framework**: NestJS (backend) | React + Vite (frontend)

---

## EXECUTIVE SUMMARY

The codebase has a **foundation-level WebSocket implementation** focused on one-way notifications. The current system:
- ✅ Basic WebSocket gateway for real-time notifications
- ✅ Notification entity with type/status tracking
- ✅ Service-to-client notification broadcasts
- ✅ Socket.io on backend, no socket.io client on frontend
- ❌ No real-time collaborative features
- ❌ No presence indicators
- ❌ No conflict resolution for simultaneous edits
- ❌ No activity feeds

---

## 1. WEBSOCKET GATEWAY ARCHITECTURE

### Backend WebSocket Setup

**File**: `/home/user/ai-based-fms/backend/src/modules/notifications/notifications.gateway.ts`

#### Current Configuration:
```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(JwtAuthGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect
```

#### Key Features:
- **Authentication**: JWT-based authentication via JwtAuthGuard
- **Namespace**: Isolated at `/notifications`
- **CORS**: Configured with frontend URL
- **User Mapping**: Maintains `userSockets: Map<string, string[]>` to track multiple connections per user

#### Current Message Handlers:
1. **`authenticate`**: Maps socket ID to user ID
2. **`getUnreadCount`**: Queries unread notification count
3. **`notification` event (outgoing)**: Broadcasts notification to user
4. **`unreadCount` event (outgoing)**: Sends updated unread count

#### Code Snippet - Message Broadcasting:
```typescript
async sendNotificationToUser(userId: string, notification: any) {
  const socketIds = this.userSockets.get(userId);
  if (socketIds && socketIds.length > 0) {
    socketIds.forEach(socketId => {
      this.server.to(socketId).emit('notification', notification);
    });
    const count = await this.notificationsService.getUnreadCount(userId);
    socketIds.forEach(socketId => {
      this.server.to(socketId).emit('unreadCount', { count });
    });
  }
}
```

### Backend Dependencies
**File**: `/home/user/ai-based-fms/backend/package.json`

```json
"@nestjs/websockets": "^10.4.20",
"@nestjs/platform-socket.io": "^10.4.20",
"socket.io": "^4.8.1"
```

---

## 2. REAL-TIME NOTIFICATION SYSTEM

### Notification Entity Structure

**File**: `/home/user/ai-based-fms/backend/src/database/entities/notification.entity.ts`

```typescript
export enum NotificationType {
  BUDGET_ALERT = 'budget_alert',
  GROUP_SETTLEMENT = 'group_settlement',
  DUE_REPAYMENT = 'due_repayment',
  AI_INSIGHT = 'ai_insight',
  IMPORT_COMPLETE = 'import_complete',
  REMINDER = 'reminder',
  SYSTEM = 'system',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  DISMISSED = 'dismissed',
}
```

**Entity Fields**:
- `id` (UUID): Primary key
- `title` (string): Notification title
- `message` (text): Detailed message
- `type` (enum): Category of notification
- `status` (enum): Read status
- `data` (JSONB): Arbitrary metadata
- `link` (string): Deep link to related resource
- `userId` (string): Target user
- `readAt` (timestamp): When user read it
- `createdAt/updatedAt` (timestamps): Lifecycle

### Notification Service Methods

**File**: `/home/user/ai-based-fms/backend/src/modules/notifications/notifications.service.ts`

#### Key Methods:
1. **create()**: Persist notification to database
2. **findAll()**: Retrieve notifications with optional filtering
3. **markAsRead()**: Update status and set readAt timestamp
4. **markAllAsRead()**: Bulk mark operation
5. **getUnreadCount()**: Query unread count
6. **createBudgetAlert()**: Helper - create budget-specific notifications
7. **createRepaymentDueAlert()**: Helper - create repayment notifications
8. **createGroupSettlementAlert()**: Helper - create group notifications

#### Current Integration Points:
- **BudgetsService**: Calls `notificationsGateway.sendNotificationToUser()` for budget alerts
- **NotificationsController**: REST API for CRUD operations
- **NotificationsPage**: React component with manual polling (30s refetch interval)

### Frontend Components

**File**: `/home/user/ai-based-fms/frontend/src/features/notifications/components/WebSocketStatus.tsx`

```typescript
export function WebSocketStatus() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-3 w-3">
          <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-blue-400 opacity-75"></span>
        </div>
        <p className="text-sm font-medium text-blue-900">
          Real-time notifications enabled
        </p>
      </div>
    </div>
  );
}
```

**Note**: This is a UI-only indicator component without actual WebSocket connection logic.

**File**: `/home/user/ai-based-fms/frontend/src/features/notifications/pages/NotificationsPage.tsx`

#### Current Implementation:
- Uses **React Query** for data fetching (not WebSocket)
- Polls API every 30 seconds: `refetchInterval: 30000`
- No socket.io client installed
- Manual unread count tracking
- REST API-based notifications API

#### Endpoints:
```typescript
export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: any) => api.patch('/notifications/preferences', data),
};
```

---

## 3. GROUP-RELATED ENTITIES AND SERVICES

### Group Entity Relationships

**File**: `/home/user/ai-based-fms/backend/src/database/entities/group.entity.ts`

```typescript
@Entity('groups')
export class Group {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  currency: string;
  isActive: boolean;
  createdBy: string;
  members: GroupMember[];      // One-to-many relationship
  transactions: GroupTransaction[]; // One-to-many relationship
  createdAt: Date;
  updatedAt: Date;
}
```

### Group Member Entity

**File**: `/home/user/ai-based-fms/backend/src/database/entities/group-member.entity.ts`

```typescript
export enum GroupMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('group_members')
export class GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: GroupMemberRole;
  balance: number;      // Tracks money owed/owed to member
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Group Transaction Entity

**File**: `/home/user/ai-based-fms/backend/src/database/entities/group-transaction.entity.ts`

```typescript
export enum SplitType {
  EQUAL = 'equal',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage',
  SHARES = 'shares',
}

@Entity('group_transactions')
export class GroupTransaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  currency: string;
  paidBy: string;                    // User ID who paid
  splitType: SplitType;
  splits: Record<string, number>;    // {userId: amount}
  notes?: string;
  attachments?: string[];
  categoryId?: string;
  groupId: string;
  isSettlement: boolean;             // Flag for payment settlements
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}
```

### Groups Service Architecture

**File**: `/home/user/ai-based-fms/backend/src/modules/groups/groups.service.ts`

#### Core Methods:

**Group Management**:
- `create()`: Create new group, add creator as admin
- `findAll()`: List all active groups for user
- `findOne()`: Get single group with members
- `update()`: Update group (admin only)
- `remove()`: Soft delete group

**Member Management**:
- `addMember()`: Add user to group (admin only)
- `removeMember()`: Remove/deactivate member
- `updateMemberRole()`: Change member role to admin/member
- `getMembers()`: List active members with user details

**Transaction Management**:
- `addTransaction()`: Create new group expense
- `getTransactions()`: Retrieve all group expenses
- `updateTransaction()`: Modify expense (reverses/reapplies balances)
- `deleteTransaction()`: Soft delete expense
- `settleUp()`: Record payment settlement

**Balance & Settlement Calculations**:
- `getBalances()`: Calculate who owes what
  ```typescript
  return members.map(member => ({
    userId: member.userId,
    name: `${member.user.firstName} ${member.user.lastName}`,
    balance: member.balance,
    owes: member.balance < 0 ? Math.abs(member.balance) : 0,
    isOwed: member.balance > 0 ? member.balance : 0,
  }));
  ```

- `getSettlementSuggestions()`: Optimal settlement algorithm
  - Finds minimum number of payments to settle all debts
  - Matches debtors with creditors

#### Balance Update Logic:
```typescript
private async updateMemberBalances(groupId: string, transaction: GroupTransaction) {
  // Payer gets credited for full amount
  payer.balance += transaction.amount;
  
  // Each member owes their split
  for (const [userId, amount] of Object.entries(transaction.splits)) {
    member.balance -= amount;
  }
}
```

### Groups Controller

**File**: `/home/user/ai-based-fms/backend/src/modules/groups/groups.controller.ts`

#### REST Endpoints:
```
POST   /groups                                 Create group
GET    /groups                                 List user's groups
GET    /groups/:id                             Get single group
PATCH  /groups/:id                             Update group
DELETE /groups/:id                             Delete group

GET    /groups/:id/members                     List members
POST   /groups/:id/members                     Add member
DELETE /groups/:id/members/:memberId           Remove member
PATCH  /groups/:id/members/:memberId           Update member role

GET    /groups/:id/transactions                List transactions
POST   /groups/:id/transactions                Add transaction
PATCH  /groups/:id/transactions/:transactionId Update transaction
DELETE /groups/:id/transactions/:transactionId Delete transaction

GET    /groups/:id/balances                    Get member balances
GET    /groups/:id/settlements                 Get settlement suggestions
POST   /groups/:id/settle                      Record settlement
```

### Frontend Groups Integration

**File**: `/home/user/ai-based-fms/frontend/src/features/groups/hooks/useGroups.ts`

```typescript
export function useGroups() {
  return useCrud<Group>({
    queryKey: 'groups',
    api: groupsApi,
  });
}
```

**Frontend API Methods** (`api.ts`):
```typescript
export const groupsApi = {
  getAll: () => api.get('/groups'),
  getOne: (id: string) => api.get(`/groups/${id}`),
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.patch(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  addMember: (id: string, data: any) => api.post(`/groups/${id}/members`, data),
  removeMember: (id: string, memberId: string) => 
    api.delete(`/groups/${id}/members/${memberId}`),
  updateMemberRole: (id: string, memberId: string, data: any) =>
    api.patch(`/groups/${id}/members/${memberId}`, data),
  getBalances: (id: string) => api.get(`/groups/${id}/balances`),
  getSettlements: (id: string) => api.get(`/groups/${id}/settlements`),
  settleUp: (id: string, data: any) => api.post(`/groups/${id}/settle`, data),
};
```

---

## 4. TRANSACTION-RELATED SERVICES

### Transaction Entity

**File**: `/home/user/ai-based-fms/backend/src/database/entities/transaction.entity.ts`

```typescript
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  LEND = 'lend',
  BORROW = 'borrow',
  GROUP = 'group',
}

export enum TransactionSource {
  MANUAL = 'manual',
  EMAIL = 'email',
  FILE_IMPORT = 'file_import',
  API = 'api',
  CHAT = 'chat',
}

@Entity('transactions')
@Index(['userId', 'date'])
@Index(['userId', 'type'])
@Index(['accountId', 'date'])
export class Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  currency: string;
  source: TransactionSource;
  notes?: string;
  location?: string;
  attachments: string[];
  referenceNumber?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  transferToAccountId?: string;
  groupTransactionId?: string;
  lendBorrowId?: string;
  metadata?: Record<string, any>;
  
  // Merge/duplicate detection
  mergedIntoId?: string;
  isMerged: boolean;
  mergedAt?: Date;
  duplicateExclusions?: string[];
  
  userId: string;
  accountId: string;
  categoryId?: string;
  tags: Tag[];
  
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}
```

### Transactions Service Key Methods

**File**: `/home/user/ai-based-fms/backend/src/modules/transactions/transactions.service.ts` (truncated from output)

#### Core Functionality:
1. **create()**: 
   - Saves transaction
   - Updates account balance
   - Creates audit log

2. **findAll()**: 
   - Filters by date range, type, category, account
   - Pagination with limit/offset
   - Relations loading

3. **update()**: 
   - Reverses old balance change
   - Applies new balance change
   - Logs changes to audit trail

4. **Merge Operations**:
   - `mergeTransactions()`: Combine duplicate transactions
   - `unmergeTransaction()`: Reverse merge
   - `markNotDuplicate()`: Record false positive

### Transactions-Groups Integration

- Transactions can reference `groupTransactionId`
- Group transactions automatically update member balances
- Settlement transactions marked with `isSettlement: true`

---

## 5. BACKEND ARCHITECTURE OVERVIEW

### Module Structure

**File**: `/home/user/ai-based-fms/backend/src/app.module.ts`

#### Imported Modules (18+ feature modules):
```
AuthModule
AccountsModule
TransactionsModule
CategoriesModule
TagsModule
BudgetsModule
GroupsModule
InvestmentsModule
LendBorrowModule
NotificationsModule ⭐
AnalyticsModule
AiModule
InsightsModule
ImportModule
EmailModule
ChatModule
AdminModule
SessionsModule
GdprModule
ExportModule
AuditModule
ReconciliationModule
DashboardPreferencesModule
ReportsModule
JobMonitorModule
```

#### Global Configuration:
- **Database**: TypeORM with PostgreSQL
- **Caching**: @nestjs/cache-manager
- **Queue**: Bull with Redis
- **Rate Limiting**: Throttler (100 req/60s)
- **Authentication**: JWT with Passport
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI

### Notifications Module Integration

**File**: `/home/user/ai-based-fms/backend/src/modules/notifications/notifications.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Notification, Reminder])],
  controllers: [NotificationsController, RemindersController],
  providers: [NotificationsService, RemindersService, NotificationsGateway],
  exports: [NotificationsService, RemindersService, NotificationsGateway],
})
export class NotificationsModule {}
```

#### How Other Modules Use It:

**BudgetsService** example:
```typescript
constructor(
  @InjectRepository(Budget) private budgetRepository: Repository<Budget>,
  @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>,
  private notificationsGateway: NotificationsGateway,  // ⭐ Injected
)

// Usage when budget limit exceeded:
await this.notificationsGateway.broadcastNotification(userId, {
  title: 'Budget Alert',
  message: `You have reached ${percentage}% of your "${budgetName}" budget`,
  type: NotificationType.BUDGET_ALERT,
  data: { budgetId, percentage },
  link: `/budgets/${budgetId}`,
});
```

---

## 6. FRONTEND ARCHITECTURE OVERVIEW

### Technology Stack
- **Framework**: React 18.2.0 + Vite
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS + Radix UI
- **Routing**: React Router v6
- **i18n**: i18next (6 languages: EN, ES, FR, DE, JA, AR)

### No WebSocket Dependencies
**Issue**: `socket.io-client` is NOT installed in `/home/user/ai-based-fms/frontend/package.json`

### Frontend Module Structure

**Key directories**:
```
frontend/src/
├── features/
│   ├── notifications/      ⭐ Currently REST-based
│   ├── groups/            ⭐ Uses REST API + React Query
│   ├── transactions/
│   ├── accounts/
│   ├── dashboard/
│   ├── [other features]/
├── services/
│   └── api.ts             ⭐ Axios-based REST client
├── hooks/
│   ├── useCrud.ts         ⭐ Generic CRUD hook
│   ├── useOptimisticUpdate.ts
│   ├── [other hooks]/
├── stores/
│   └── authStore.ts       ⭐ Zustand auth state
└── components/
    └── layout/
        └── Layout.tsx     ❌ No WebSocket initialization
```

### Notifications Frontend Implementation

**No WebSocket Client**: Notifications use polling with React Query:
```typescript
const { data: notifications } = useQuery({
  queryKey: ['notifications', filter],
  queryFn: () => notificationsApi.getAll(...),
  refetchInterval: 30000,  // Poll every 30 seconds
});
```

### Groups Frontend Implementation

**Hook Pattern** (`useGroups.ts`):
```typescript
export function useGroups() {
  return useCrud<Group>({
    queryKey: 'groups',
    api: groupsApi,
  });
}
```

**Generic CRUD Hook** (`useCrud.ts`):
- Provides: `data`, `isLoading`, `error`, `create()`, `update()`, `delete()`
- Uses React Query internally
- Automatic cache invalidation
- Error handling

---

## CURRENT GAPS FOR REAL-TIME COLLABORATION

### 1. No WebSocket Client on Frontend
- ❌ `socket.io-client` package not installed
- ❌ No socket connection service
- ❌ No event listeners setup
- ❌ Falling back to REST + polling (30s intervals)

### 2. No Collaborative Features
- ❌ No "user is typing" indicators
- ❌ No presence/online status
- ❌ No real-time group transaction updates
- ❌ No activity feed
- ❌ No conflict resolution for simultaneous edits

### 3. No Collaborative Message Types
- ❌ No presence events (user:online, user:offline)
- ❌ No activity events (transaction:created, member:joined)
- ❌ No cursor position sharing
- ❌ No lock mechanisms for concurrent editing

### 4. Missing Namespace Organization
- Currently only: `/notifications` namespace
- Needed: `/groups/{groupId}`, `/transactions`, `/presence`, etc.

### 5. No Optimistic Updates
- Group transaction updates wait for server
- No client-side prediction
- No rollback on failure visibility
- Could implement `useOptimisticUpdate` hook (already exists!)

---

## READY-TO-USE EXISTING FEATURES

### What's Already Built
1. **Notification Infrastructure**: 
   - Database schema for notifications
   - Gateway for pushing to clients
   - Service methods for creating various notification types
   - Controller for REST management

2. **Group Infrastructure**:
   - Full entity relationships (Group → Members → Transactions)
   - Balance calculation algorithms
   - Settlement suggestion algorithm
   - Complete REST API

3. **Transaction Infrastructure**:
   - Audit logging
   - Duplicate detection
   - Merge functionality
   - Multiple transaction sources

4. **Frontend Utilities**:
   - `useCrud` hook for generic data operations
   - `useOptimisticUpdate` hook for optimistic updates
   - `useQueryClient` for cache management
   - React Query setup for data fetching

---

## RECOMMENDATIONS FOR REAL-TIME COLLABORATION

### Phase 1: Enable WebSocket Client (1-2 days)
1. Install `socket.io-client` package
2. Create `useWebSocket` hook with:
   - Connection management
   - Automatic reconnection
   - Error handling
   - Presence tracking
3. Integrate into Layout component
4. Set up event listeners for notifications

### Phase 2: Real-Time Group Updates (2-3 days)
1. Create `/groups/{groupId}` namespace on backend
2. Emit events for:
   - `transaction:created`
   - `transaction:updated`
   - `transaction:deleted`
   - `member:joined`
   - `member:left`
   - `settlement:recorded`
3. Consume events on frontend with React Query invalidation

### Phase 3: Presence & Collaboration (2-3 days)
1. Add presence events to gateway
2. Show "User X is editing" indicators
3. Implement basic conflict resolution (last-write-wins)
4. Add activity feed component

### Phase 4: Optimistic Updates (1-2 days)
1. Use existing `useOptimisticUpdate` hook
2. Implement rollback on server errors
3. Visual feedback for in-flight changes

---

## FILE LOCATIONS SUMMARY

### Backend WebSocket
- Gateway: `/home/user/ai-based-fms/backend/src/modules/notifications/notifications.gateway.ts`
- Service: `/home/user/ai-based-fms/backend/src/modules/notifications/notifications.service.ts`
- Module: `/home/user/ai-based-fms/backend/src/modules/notifications/notifications.module.ts`
- Entity: `/home/user/ai-based-fms/backend/src/database/entities/notification.entity.ts`

### Backend Groups
- Service: `/home/user/ai-based-fms/backend/src/modules/groups/groups.service.ts`
- Controller: `/home/user/ai-based-fms/backend/src/modules/groups/groups.controller.ts`
- Group Entity: `/home/user/ai-based-fms/backend/src/database/entities/group.entity.ts`
- Member Entity: `/home/user/ai-based-fms/backend/src/database/entities/group-member.entity.ts`
- Transaction Entity: `/home/user/ai-based-fms/backend/src/database/entities/group-transaction.entity.ts`
- DTOs: `/home/user/ai-based-fms/backend/src/modules/groups/dto/`

### Backend Transactions
- Service: `/home/user/ai-based-fms/backend/src/modules/transactions/transactions.service.ts`
- Entity: `/home/user/ai-based-fms/backend/src/database/entities/transaction.entity.ts`

### Frontend Notifications
- Page: `/home/user/ai-based-fms/frontend/src/features/notifications/pages/NotificationsPage.tsx`
- Components: `/home/user/ai-based-fms/frontend/src/features/notifications/components/`
- WebSocket Status: `/home/user/ai-based-fms/frontend/src/features/notifications/components/WebSocketStatus.tsx`

### Frontend Groups
- Hook: `/home/user/ai-based-fms/frontend/src/features/groups/hooks/useGroups.ts`
- Page: `/home/user/ai-based-fms/frontend/src/features/groups/pages/GroupsPage.tsx`
- Components: `/home/user/ai-based-fms/frontend/src/features/groups/components/`

### Frontend Utilities
- API Service: `/home/user/ai-based-fms/frontend/src/services/api.ts`
- useOptimisticUpdate: `/home/user/ai-based-fms/frontend/src/hooks/useOptimisticUpdate.ts`

### Configuration
- Main App: `/home/user/ai-based-fms/backend/src/app.module.ts`
- Backend Entry: `/home/user/ai-based-fms/backend/src/main.ts`
- Frontend App: `/home/user/ai-based-fms/frontend/src/App.tsx`
- Frontend Layout: `/home/user/ai-based-fms/frontend/src/components/layout/Layout.tsx`

### Dependencies
- Backend: `/home/user/ai-based-fms/backend/package.json`
- Frontend: `/home/user/ai-based-fms/frontend/package.json`

---

## NEXT STEPS

1. **Verify WebSocket is actually running**: Check if NotificationsGateway is being instantiated
2. **Install socket.io-client**: Add client-side WebSocket library
3. **Implement useWebSocket hook**: Create the missing connection layer
4. **Start emitting group events**: Extend gateway with `/groups` namespace
5. **Update frontend components**: Connect to WebSocket events
6. **Test multi-user scenarios**: Ensure concurrent updates work correctly

---

**Report Generated**: November 12, 2025
**Repository**: `/home/user/ai-based-fms`
**Branch**: `claude/check-md-files-cleanup-011CV4HZK8MYaZbWEUU5ScrC`
