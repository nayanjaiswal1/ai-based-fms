export function WebSocketStatus() {
  return (
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
  );
}
