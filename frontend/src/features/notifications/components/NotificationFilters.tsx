interface NotificationFiltersProps {
  filter: 'all' | 'unread';
  onFilterChange: (filter: 'all' | 'unread') => void;
  unreadCount: number | undefined;
}

export function NotificationFilters({ filter, onFilterChange, unreadCount }: NotificationFiltersProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange('all')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          filter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('unread')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          filter === 'unread'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Unread
        {unreadCount && unreadCount > 0 && (
          <span
            className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
              filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
