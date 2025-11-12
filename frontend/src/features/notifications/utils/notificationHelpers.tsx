import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export function getNotificationIcon(type: string) {
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
}

export function getNotificationBgColor(type: string, isRead: boolean): string {
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
}
