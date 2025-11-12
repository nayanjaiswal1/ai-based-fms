import { Check } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number | undefined;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
}

export function NotificationHeader({ unreadCount, onMarkAllRead, isMarkingAllRead }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount && unreadCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Stay updated with your financial activities
        </p>
      </div>
      {unreadCount && unreadCount > 0 && (
        <button
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Mark All Read
        </button>
      )}
    </div>
  );
}
