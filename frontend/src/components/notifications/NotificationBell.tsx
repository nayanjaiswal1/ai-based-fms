import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/services/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', { limit: 10 }],
    queryFn: () => notificationsApi.getAll({ limit: 10 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Extract notifications array from response
  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : notificationsData?.data || notificationsData?.notifications || [];

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const unreadCount = unreadCountData?.count || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BUDGET_ALERT':
        return '💰';
      case 'BUDGET_EXCEEDED':
        return '⚠️';
      case 'REMINDER':
        return '⏰';
      case 'PAYMENT_REMINDER':
        return '💳';
      case 'GROUP_INVITE':
        return '👥';
      case 'GROUP_EXPENSE':
        return '💸';
      case 'SETTLEMENT':
        return '✅';
      default:
        return '🔔';
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="group relative rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-accent/20 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          type="button"
        >
          <Bell className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 max-h-[600px] overflow-hidden flex flex-col"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              type="button"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-foreground">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-accent/10 ${
                    !notification.isRead ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary"></span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              disabled={markAsReadMutation.isPending}
                              className="rounded p-1 text-muted-foreground hover:bg-accent/20 hover:text-primary transition-colors disabled:opacity-50"
                              aria-label="Mark as read"
                              type="button"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            disabled={deleteMutation.isPending}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors disabled:opacity-50"
                            aria-label="Delete notification"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
