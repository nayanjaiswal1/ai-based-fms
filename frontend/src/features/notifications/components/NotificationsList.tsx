import { Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsListProps {
  notifications: Notification[] | undefined;
  isLoading: boolean;
  filter: 'all' | 'unread';
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}

export function NotificationsList({
  notifications,
  isLoading,
  filter,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
          isMarkingRead={isMarkingRead}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
