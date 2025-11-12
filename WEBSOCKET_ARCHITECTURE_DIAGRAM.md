# WebSocket Architecture Diagram

## Current Architecture (Foundation Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  App.tsx                    Layout.tsx                           │
│      │                          │                                │
│      └──────────────┬───────────┘                                │
│                     │                                            │
│         ┌───────────▼─────────────┐                              │
│         │  NotificationsPage      │                              │
│         │  (REST + Polling 30s)   │                              │
│         └───────────┬─────────────┘                              │
│                     │                                            │
│         ┌───────────▼─────────────┐                              │
│         │   GroupsPage            │                              │
│         │   (REST API only)       │                              │
│         └───────────┬─────────────┘                              │
│                     │                                            │
│         ┌───────────▼──────────────┐                             │
│         │  React Query + Axios     │                             │
│         │  (No socket.io-client!)  │                             │
│         └───────────┬──────────────┘                             │
│                     │                                            │
│                     └─────┬──────────────────────────────────┐   │
│                           │                                  │   │
└─────────────────────────────────────────────────────────────┼───┘
                            │                                  │
                    HTTP/REST (Axios)        NO CONNECTION!    │
                            │                                  │
┌─────────────────────────────────────────────────────────────┼───┐
│                     BACKEND (NestJS)                         │   │
├─────────────────────────────────────────────────────────────┼───┤
│                                                              │   │
│  app.module.ts                                              │   │
│       │                                                      │   │
│       └──────────────────────┬──────────────────────────┐   │   │
│                              │                          │   │   │
│                 ┌────────────▼─────────────┐           │   │   │
│                 │ NotificationsModule      │           │   │   │
│                 │                          │           │   │   │
│                 │ ┌──────────────────────┐ │           │   │   │
│                 │ │ Gateway (WebSocket)  │ │           │   │   │
│                 │ │ @ /notifications     │ │           │   │   │
│                 │ │ - authenticate       │ │           │   │   │
│                 │ │ - getUnreadCount     │ │           │   │   │
│                 │ │ -> notification      │ │────────────┼───┼───┼──┐
│                 │ │ -> unreadCount       │ │           │   │   │  │
│                 │ └──────────────────────┘ │           │   │   │  │
│                 │                          │           │   │   │  │
│                 │ ┌──────────────────────┐ │           │   │   │  │
│                 │ │ NotificationsService │ │           │   │   │  │
│                 │ │ NotificationsControl │ │           │   │   │  │
│                 │ └──────────────────────┘ │           │   │   │  │
│                 └────────────┬─────────────┘           │   │   │  │
│                              │                          │   │   │  │
│                 ┌────────────▼─────────────┐           │   │   │  │
│                 │ GroupsModule             │           │   │   │  │
│                 │ (REST only, no WS)       │           │   │   │  │
│                 │                          │           │   │   │  │
│                 │ ┌──────────────────────┐ │           │   │   │  │
│                 │ │ GroupsService        │ │           │   │   │  │
│                 │ │ - Group CRUD         │ │────┬──────┼─┐ │   │  │
│                 │ │ - Member Management  │ │    │      │ │ │   │  │
│                 │ │ - Transaction Mgmt   │ │    │      │ │ │   │  │
│                 │ │ - Balance Calc       │ │    │      │ │ │   │  │
│                 │ │ - Settlement Suggest │ │    │      │ │ │   │  │
│                 │ └──────────────────────┘ │    │      │ │ │   │  │
│                 │                          │    │      │ │ │   │  │
│                 │ ┌──────────────────────┐ │    │      │ │ │   │  │
│                 │ │ GroupsController     │ │    │      │ │ │   │  │
│                 │ │ (REST endpoints)     │ │────┼──────┼─┤ │   │  │
│                 │ └──────────────────────┘ │    │      │ │ │   │  │
│                 └────────────┬─────────────┘    │      │ │ │   │  │
│                              │                  │      │ │ │   │  │
│                 ┌────────────▼─────────────┐    │      │ │ │   │  │
│                 │ TransactionsModule       │    │      │ │ │   │  │
│                 │ (REST only)              │    │      │ │ │   │  │
│                 │ - Transaction Service   │    │      │ │ │   │  │
│                 │ - Audit integration     │    │      │ │ │   │  │
│                 │ - Merge/Duplicate logic │    │      │ │ │   │  │
│                 └────────────┬─────────────┘    │      │ │ │   │  │
│                              │                  │      │ │ │   │  │
│                 ┌────────────▼─────────────┐    │      │ │ │   │  │
│                 │ BudgetsModule            │    │      │ │ │   │  │
│                 │ - Calls NotifGateway     │◄───┘      │ │ │   │  │
│                 │ - Sends budget alerts    │           │ │ │   │  │
│                 └──────────────────────────┘           │ │ │   │  │
│                                                         │ │ │   │  │
│  ┌───────────────────────────────────────────────────┬─┴─┴───┐ │
│  │ Database (PostgreSQL)                             │       │ │
│  │                                                   │       │ │
│  │ ┌──────────────────┐  ┌──────────────┐  ┌─────┐ │       │ │
│  │ │ notifications    │  │ groups       │  │ ... │ │       │ │
│  │ │ - id             │  │ - id         │  │     │ │       │ │
│  │ │ - title          │  │ - name       │  └─────┘ │       │ │
│  │ │ - message        │  │ - currency   │          │       │ │
│  │ │ - type (enum)    │  │ - createdBy  │ ┌──────────────┐ │
│  │ │ - status (enum)  │  │ - createdAt  │ │group_members │ │
│  │ │ - data (jsonb)   │  │ - updatedAt  │ │ - groupId    │ │
│  │ │ - link           │  │              │ │ - userId     │ │
│  │ │ - readAt         │  └──────────────┘ │ - role       │ │
│  │ │ - userId (FK)    │                   │ - balance    │ │
│  │ │ - createdAt      │  ┌──────────────┐ └──────────────┘ │
│  │ │ - updatedAt      │  │group_transact│                  │
│  │ └──────────────────┘  │ - amount     │ ┌──────────────┐ │
│  │                       │ - paidBy     │ │transactions  │ │
│  │                       │ - splits     │ │ - amount     │ │
│  │                       │ - date       │ │ - type       │ │
│  │                       │ - groupId    │ │ - date       │ │
│  │                       │ - isSettlem. │ │ - userId     │ │
│  │                       └──────────────┘ └──────────────┘ │
│  │                                                         │
│  └─────────────────────────────────────────────────────────┘
│
│  Redis (Caching, Bull Queues)
│  Socket.io Server (Listening but no clients!)
│
└─────────────────────────────────────────────────────────────┐
```

## What Works Today

✅ **Backend WebSocket Server**
- NotificationsGateway listening on `/notifications` namespace
- JWT authentication
- User socket mapping
- Methods to broadcast notifications

✅ **Notification Infrastructure**
- Database persistence
- Service layer for CRUD
- Multiple notification types
- Integration with BudgetsService

✅ **Groups Infrastructure**
- Complete CRUD operations
- Member management with roles
- Transaction tracking
- Balance calculations
- Settlement suggestions
- Soft delete support

✅ **Transaction Infrastructure**
- Audit trail integration
- Duplicate detection
- Merge functionality
- Multiple source types

✅ **Frontend Foundation**
- React Query for state management
- REST API client (Axios)
- Generic useOptimisticUpdate hook
- Zustand for auth state

## What's Missing for Real-Time Collaboration

❌ **Frontend WebSocket Client**
- No socket.io-client package
- No WebSocket connection service
- No event listeners
- Notifications using 30s polling instead

❌ **Real-Time Features**
- No presence indicators
- No activity feed
- No concurrent editing support
- No conflict resolution
- No "user is typing" indicators

❌ **Group Real-Time Updates**
- No real-time transaction notifications
- No live balance updates
- No member presence in groups
- No collaborative expense management

❌ **Advanced Features**
- No chat/comments in groups
- No collaborative budgets
- No file attachments with versioning
- No edit lock mechanisms

---

## Implementation Roadmap

### Phase 1: WebSocket Client Setup (1-2 days)
1. Install socket.io-client
2. Create useWebSocket hook
3. Initialize connection in Layout
4. Connect to /notifications namespace
5. Listen for notification and unreadCount events

### Phase 2: Real-Time Group Notifications (2-3 days)
1. Create /groups/{groupId} namespace on backend
2. Emit transaction events (created, updated, deleted)
3. Emit member events (joined, left, role changed)
4. Emit settlement events
5. Frontend subscribes and invalidates React Query cache

### Phase 3: Presence & Activity (2-3 days)
1. Track user presence in groups
2. Show "X is viewing group" indicator
3. Add activity feed component
4. Show who's online in member list
5. Presence timeout handling (disconnections)

### Phase 4: Optimistic Updates (1-2 days)
1. Use existing useOptimisticUpdate hook
2. Implement client-side prediction
3. Show rollback UI on failures
4. In-flight state visualization
5. Error recovery

---

## Key Integration Points

**When implementing, you'll integrate with:**

1. **NotificationsGateway** - Extend with new namespaces
2. **GroupsService** - Add event emissions
3. **TransactionsService** - Emit updates when transactions change
4. **Layout.tsx** - Initialize WebSocket connection
5. **useGroups hook** - Connect to real-time updates
6. **React Query** - Invalidate caches on server events

---

Generated: November 12, 2025
