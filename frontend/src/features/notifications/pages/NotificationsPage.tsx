import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@services/api';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount?.data > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
                {unreadCount.data}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Stay updated with your financial activities
          </p>
        </div>
        {unreadCount?.data > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Unread
          {unreadCount?.data > 0 && (
            <span
              className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {unreadCount.data}
            </span>
          )}
        </button>
      </div>

      {/* WebSocket Status */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3">
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Real-time notifications enabled
            </p>
            <p className="text-xs text-blue-700">
              You'll receive instant updates for budget alerts, reminders, and more
            </p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : notifications?.data?.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'unread'
              ? "You're all caught up!"
              : "You'll see notifications here when you have activity"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications?.data?.map((notification: any) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-lg p-4 shadow transition-colors ${getNotificationBgColor(
                notification.type,
                notification.isRead
              )}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 pt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                      {!notification.isRead && (
                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 gap-2">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={markReadMutation.isPending}
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50"
                    title="Mark as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Notification Types
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <NotificationTypeCard
            icon={Target}
            title="Budget Alerts"
            description="Get notified when you reach 75%, 90%, or exceed your budgets"
            color="text-yellow-600"
          />
          <NotificationTypeCard
            icon={Bell}
            title="Payment Reminders"
            description="Never miss a payment with customizable reminders"
            color="text-blue-600"
          />
          <NotificationTypeCard
            icon={Users}
            title="Group Updates"
            description="Stay informed about group expenses and settlements"
            color="text-purple-600"
          />
          <NotificationTypeCard
            icon={TrendingUp}
            title="Investment Changes"
            description="Track significant changes in your investment portfolio"
            color="text-green-600"
          />
        </div>
      </div>

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}

function NotificationTypeCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// Import the missing icons for the notification types
import { Target, Users, TrendingUp } from 'lucide-react';
