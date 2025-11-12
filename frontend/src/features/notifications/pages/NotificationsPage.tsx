import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@services/api';
import { useState } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NotificationHeader } from '../components/NotificationHeader';
import { NotificationFilters } from '../components/NotificationFilters';
import { WebSocketStatus } from '../components/WebSocketStatus';
import { NotificationsList } from '../components/NotificationsList';
import { NotificationTypesInfo } from '../components/NotificationTypesInfo';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () =>
      notificationsApi.getAll(filter === 'unread' ? { isRead: false } : undefined),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleMarkRead = async (id: string) => {
    await markReadMutation.mutateAsync(id);
  };

  const handleMarkAllRead = async () => {
    confirm({
      title: 'Mark All as Read',
      message: 'Mark all notifications as read?',
      variant: 'info',
      confirmLabel: 'Mark All Read',
      onConfirm: async () => {
        await markAllReadMutation.mutateAsync();
      },
    });
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Notification',
      message: 'Delete this notification?',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <NotificationHeader
        unreadCount={unreadCount?.data}
        onMarkAllRead={handleMarkAllRead}
        isMarkingAllRead={markAllReadMutation.isPending}
      />

      {/* Filters */}
      <NotificationFilters
        filter={filter}
        onFilterChange={setFilter}
        unreadCount={unreadCount?.data}
      />

      {/* WebSocket Status */}
      <WebSocketStatus />

      {/* Notifications List */}
      <NotificationsList
        notifications={notifications?.data}
        isLoading={isLoading}
        filter={filter}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
        isMarkingRead={markReadMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Info Card */}
      <NotificationTypesInfo />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
