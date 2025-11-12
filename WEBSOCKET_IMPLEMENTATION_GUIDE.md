# WebSocket Real-Time Collaboration - Implementation Guide

## Quick Reference

This guide shows how to implement real-time collaboration features for the Finance Management System.

---

## Step 1: Install Frontend WebSocket Client

```bash
cd /home/user/ai-based-fms/frontend
npm install socket.io-client
```

---

## Step 2: Create useWebSocket Hook

**File**: `frontend/src/hooks/useWebSocket.ts`

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@stores/authStore';
import { API_CONFIG } from '@config/api.config';

interface UseWebSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    namespace = '/notifications',
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const { user, accessToken } = useAuthStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !user || !accessToken) {
      return;
    }

    try {
      socketRef.current = io(`${API_CONFIG.baseURL}${namespace}`, {
        auth: {
          token: accessToken,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected:', socketRef.current?.id);
        // Emit authenticate after connection
        socketRef.current?.emit('authenticate', user.id);
        onConnect?.();
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        onError?.(error);
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      onError?.(error);
    }
  }, [user, accessToken, namespace, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit event "${event}" - WebSocket not connected`);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected ?? false,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
```

---

## Step 3: Initialize WebSocket in Layout

**File**: `frontend/src/components/layout/Layout.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { SkipNav } from '@/components/a11y';
import { useWebSocket } from '@hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize WebSocket connection
  const { connected, on } = useWebSocket({
    namespace: '/notifications',
    autoConnect: true,
    onConnect: () => {
      console.log('Connected to notifications');
      toast({
        title: 'Connected',
        description: 'Real-time notifications enabled',
        variant: 'success',
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from notifications');
      toast({
        title: 'Disconnected',
        description: 'Real-time connection lost. Retrying...',
        variant: 'warning',
      });
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to establish real-time connection',
        variant: 'error',
      });
    },
  });

  // Listen for notification events
  useEffect(() => {
    on('notification', (notification) => {
      console.log('Received notification:', notification);
      // Invalidate notifications cache to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    on('unreadCount', (data) => {
      console.log('Updated unread count:', data.count);
      // Update unread count query
      queryClient.setQueryData(['notifications-unread-count'], data);
    });
  }, [on, queryClient]);

  const handleOpenMobileNav = () => {
    setIsMobileNavOpen(true);
  };

  const handleCloseMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="flex h-screen bg-secondary transition-colors">
      <SkipNav />
      <aside className="hidden lg:block" aria-label="Main navigation">
        <Sidebar />
      </aside>
      <MobileNav isOpen={isMobileNavOpen} onClose={handleCloseMobileNav} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onMenuClick={handleOpenMobileNav}
          webSocketConnected={connected}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-secondary p-4 sm:p-6"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## Step 4: Create Group-Specific WebSocket Hook

**File**: `frontend/src/hooks/useGroupWebSocket.ts`

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';

export function useGroupWebSocket(groupId: string) {
  const queryClient = useQueryClient();
  const { connected, on, emit } = useWebSocket({
    namespace: `/groups/${groupId}`,
    autoConnect: true,
  });

  useEffect(() => {
    if (!connected) return;

    // Listen for transaction events
    on('transaction:created', (data) => {
      console.log('Transaction created:', data);
      // Invalidate group queries
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    on('transaction:updated', (data) => {
      console.log('Transaction updated:', data);
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    on('transaction:deleted', (data) => {
      console.log('Transaction deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    // Listen for member events
    on('member:joined', (data) => {
      console.log('Member joined:', data);
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    on('member:left', (data) => {
      console.log('Member left:', data);
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    // Listen for settlement events
    on('settlement:recorded', (data) => {
      console.log('Settlement recorded:', data);
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
    });

    // Listen for presence events
    on('presence:update', (data) => {
      console.log('Presence updated:', data);
      queryClient.invalidateQueries({ queryKey: ['group-presence', groupId] });
    });
  }, [connected, on, groupId, queryClient]);

  const emitPresence = (status: 'viewing' | 'editing' | 'offline') => {
    emit('presence:update', { status, timestamp: new Date().toISOString() });
  };

  const notifyTyping = (field: string) => {
    emit('user:typing', { field, timestamp: new Date().toISOString() });
  };

  return {
    connected,
    emitPresence,
    notifyTyping,
  };
}
```

---

## Step 5: Extend Backend Gateway with Group Events

**File**: `backend/src/modules/notifications/notifications.gateway.ts` (Enhanced)

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(JwtAuthGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);

    if (client.userId) {
      const sockets = this.userSockets.get(client.userId) || [];
      const filtered = sockets.filter(id => id !== client.id);

      if (filtered.length > 0) {
        this.userSockets.set(client.userId, filtered);
      } else {
        this.userSockets.delete(client.userId);
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: AuthenticatedSocket, userId: string) {
    client.userId = userId;

    const sockets = this.userSockets.get(userId) || [];
    sockets.push(client.id);
    this.userSockets.set(userId, sockets);

    console.log(`Client ${client.id} authenticated as user ${userId}`);

    return { success: true, message: 'Authenticated successfully' };
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    const count = await this.notificationsService.getUnreadCount(client.userId);
    return { count };
  }

  // Send notification to specific user
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

  // Broadcast notification
  async broadcastNotification(userId: string, createDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(userId, createDto);
    await this.sendNotificationToUser(userId, notification);
    return notification;
  }

  // NEW: Send group transaction event
  async broadcastGroupEvent(groupId: string, event: string, data: any) {
    this.server.to(`group:${groupId}`).emit(event, data);
  }

  // NEW: Send presence update to group
  async broadcastPresence(groupId: string, userId: string, status: string) {
    this.server.to(`group:${groupId}`).emit('presence:update', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## Step 6: Emit Events from Groups Service

**File**: `backend/src/modules/groups/groups.service.ts` (Enhanced)

Add at the top:
```typescript
import { NotificationsGateway } from '@modules/notifications/notifications.gateway';
```

Add to constructor:
```typescript
constructor(
  @InjectRepository(Group)
  private groupRepository: Repository<Group>,
  @InjectRepository(GroupMember)
  private memberRepository: Repository<GroupMember>,
  @InjectRepository(GroupTransaction)
  private transactionRepository: Repository<GroupTransaction>,
  private notificationsGateway: NotificationsGateway, // ⭐ Add this
)
```

Update `addTransaction()`:
```typescript
async addTransaction(groupId: string, userId: string, createDto: CreateGroupTransactionDto) {
  await this.checkMemberAccess(groupId, userId);

  const splitTotal = Object.values(createDto.splits).reduce((sum, amount) => sum + amount, 0);
  if (Math.abs(splitTotal - createDto.amount) > 0.01) {
    throw new BadRequestException('Split amounts must equal transaction amount');
  }

  const transaction = this.transactionRepository.create({
    ...createDto,
    groupId,
    createdBy: userId,
  });

  const saved = await this.transactionRepository.save(transaction);
  await this.updateMemberBalances(groupId, saved);

  // ⭐ NEW: Broadcast event
  await this.notificationsGateway.broadcastGroupEvent(groupId, 'transaction:created', {
    transaction: saved,
    createdBy: userId,
    timestamp: new Date().toISOString(),
  });

  return saved;
}
```

Update `updateTransaction()`:
```typescript
async updateTransaction(groupId: string, transactionId: string, userId: string, updateDto: UpdateGroupTransactionDto) {
  await this.checkMemberAccess(groupId, userId);

  const transaction = await this.transactionRepository.findOne({
    where: { id: transactionId, groupId },
  });

  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }

  await this.reverseMemberBalances(groupId, transaction);
  Object.assign(transaction, { ...updateDto, updatedBy: userId });
  const updated = await this.transactionRepository.save(transaction);
  await this.updateMemberBalances(groupId, updated);

  // ⭐ NEW: Broadcast event
  await this.notificationsGateway.broadcastGroupEvent(groupId, 'transaction:updated', {
    transaction: updated,
    updatedBy: userId,
    timestamp: new Date().toISOString(),
  });

  return updated;
}
```

Update `deleteTransaction()`:
```typescript
async deleteTransaction(groupId: string, transactionId: string, userId: string) {
  await this.checkMemberAccess(groupId, userId);

  const transaction = await this.transactionRepository.findOne({
    where: { id: transactionId, groupId },
  });

  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }

  await this.reverseMemberBalances(groupId, transaction);
  transaction.isDeleted = true;
  const result = await this.transactionRepository.save(transaction);

  // ⭐ NEW: Broadcast event
  await this.notificationsGateway.broadcastGroupEvent(groupId, 'transaction:deleted', {
    transactionId: transaction.id,
    deletedBy: userId,
    timestamp: new Date().toISOString(),
  });

  return result;
}
```

Update `settleUp()`:
```typescript
async settleUp(groupId: string, userId: string, settleDto: SettleUpDto) {
  await this.checkMemberAccess(groupId, userId);

  const settlement = this.transactionRepository.create({
    groupId,
    description: `Settlement: ${settleDto.fromUserId} → ${settleDto.toUserId}`,
    amount: settleDto.amount,
    date: settleDto.date || new Date(),
    paidBy: settleDto.toUserId,
    splitType: SplitType.CUSTOM,
    splits: {
      [settleDto.fromUserId]: settleDto.amount,
    },
    notes: settleDto.notes || 'Settlement payment',
    isSettlement: true,
    createdBy: userId,
  });

  const saved = await this.transactionRepository.save(settlement);
  await this.updateMemberBalances(groupId, saved);

  // ⭐ NEW: Broadcast event
  await this.notificationsGateway.broadcastGroupEvent(groupId, 'settlement:recorded', {
    settlement: saved,
    recordedBy: userId,
    timestamp: new Date().toISOString(),
  });

  return saved;
}
```

---

## Step 7: Use in Components

**File**: `frontend/src/features/groups/pages/GroupsPage.tsx` (Example usage)

```typescript
import { useGroupWebSocket } from '@hooks/useGroupWebSocket';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@services/api';

export default function GroupDetailPage({ groupId }: { groupId: string }) {
  // Connect to group WebSocket
  const { connected, emitPresence } = useGroupWebSocket(groupId);

  // Fetch group data (will auto-update when WebSocket events arrive)
  const { data: group } = useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => groupsApi.getOne(groupId),
  });

  const { data: transactions } = useQuery({
    queryKey: ['group-transactions', groupId],
    queryFn: () => groupsApi.getExpenses(groupId),
  });

  const { data: balances } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => groupsApi.getBalances(groupId),
  });

  // Notify others when viewing this group
  useEffect(() => {
    if (connected) {
      emitPresence('viewing');
      return () => {
        emitPresence('offline');
      };
    }
  }, [connected, emitPresence]);

  return (
    <div className="space-y-6">
      {/* WebSocket connection indicator */}
      <div className={`p-2 text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
        {connected ? '🟢 Real-time updates active' : '🔴 Offline mode'}
      </div>

      {/* Group details */}
      {group && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          
          {/* Balances */}
          <div className="grid gap-4">
            {balances?.map((balance) => (
              <div key={balance.userId} className="p-4 border rounded">
                <p className="font-semibold">{balance.name}</p>
                <p className="text-sm">
                  {balance.balance > 0
                    ? `is owed $${balance.isOwed}`
                    : `owes $${balance.owes}`}
                </p>
              </div>
            ))}
          </div>

          {/* Transactions - will update in real-time */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Transactions</h2>
            {transactions?.map((transaction) => (
              <div key={transaction.id} className="p-3 border rounded">
                <p className="font-semibold">{transaction.description}</p>
                <p className="text-sm">${transaction.amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Implementation Checklist

- [ ] Install socket.io-client package
- [ ] Create useWebSocket hook
- [ ] Create useGroupWebSocket hook  
- [ ] Update Layout.tsx to initialize WebSocket
- [ ] Create /groups/{groupId} namespace on backend
- [ ] Update NotificationsGateway with group events
- [ ] Emit events from GroupsService methods
- [ ] Update GroupDetail component to use WebSocket
- [ ] Test with multiple users
- [ ] Add presence indicators
- [ ] Add activity feed
- [ ] Implement optimistic updates
- [ ] Add typing indicators
- [ ] Handle disconnections gracefully

---

## Testing the Real-Time Features

### Local Testing with Multiple Browser Windows

1. Open group detail page in two browser windows
2. Add transaction in first window
3. Watch it appear in real-time in second window (no page refresh needed)
4. Check network tab to verify WebSocket messages

### Testing Presence

1. Open group in window A (should show "viewing")
2. Close group in window A (should show "offline")
3. Verify UI updates reflect presence status

### Testing with Network Throttling

1. Open DevTools Network tab
2. Add slow 3G throttling
3. Add transaction - should show optimistic UI while pending
4. Verify it completes when network recovers

---

## Error Handling Best Practices

```typescript
// Always wrap socket operations in try-catch
try {
  emit('event:name', data);
} catch (error) {
  console.error('Failed to emit event:', error);
  // Show user-friendly error message
  toast({
    title: 'Connection Error',
    description: 'Failed to sync with server',
    variant: 'error',
  });
}

// Always implement fallback to REST API
if (!connected) {
  // Fall back to REST API call
  await groupsApi.addTransaction(groupId, data);
} else {
  // Use optimistic update with WebSocket
  emitOptimisticUpdate('transaction:create', data);
}
```

---

## Performance Considerations

1. **Debounce presence updates**: Don't send every keystroke
2. **Namespace isolation**: Each group gets its own WebSocket room
3. **Event filtering**: Only broadcast relevant events
4. **Query invalidation**: Use React Query's selective cache invalidation
5. **Connection pooling**: Reuse single WebSocket connection for multiple namespaces

---

**Generated**: November 12, 2025
**Framework**: NestJS + React
**WebSocket Library**: Socket.io 4.8.1
