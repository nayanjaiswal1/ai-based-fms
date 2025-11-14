import { Check } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number | undefined;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
}

export function NotificationHeader({ unreadCount, onMarkAllRead, isMarkingAllRead }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {unreadCount && unreadCount > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Unread:</span>
          <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
            {unreadCount}
          </span>
        </div>
      )}
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
