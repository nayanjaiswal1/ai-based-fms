import { Check, Trash2 } from 'lucide-react';
import { getNotificationIcon, getNotificationBgColor } from '../utils/notificationHelpers';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationItemProps) {
  return (
    <div
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
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarkingRead}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50"
            title="Mark as read"
          >
            <Check className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          disabled={isDeleting}
          className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
