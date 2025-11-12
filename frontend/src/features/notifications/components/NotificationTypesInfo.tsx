import { Target, Bell, Users, TrendingUp, LucideIcon } from 'lucide-react';

interface NotificationTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

function NotificationTypeCard({ icon: Icon, title, description, color }: NotificationTypeCardProps) {
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

export function NotificationTypesInfo() {
  return (
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
  );
}
