import { Calendar, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
}

interface Props {
  bills?: Bill[];
  config?: Record<string, any>;
}

export function UpcomingBillsWidget({ bills = [], config }: Props) {
  const { symbol } = useCurrency();
  const upcomingBills = bills
    .filter(bill => !bill.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const totalAmount = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  const getDueDateColor = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Upcoming Bills'}
        </h3>
        <Calendar className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600">Total Due</p>
        <p className="text-xl font-bold text-blue-600">{symbol()}{totalAmount.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        {upcomingBills.map((bill) => {
          const daysUntil = getDaysUntilDue(bill.dueDate);
          return (
            <div
              key={bill.id}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{bill.name}</p>
                <p className="text-xs text-gray-500">{bill.category}</p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-gray-900">
                  {symbol()}{bill.amount.toFixed(2)}
                </p>
                <p className={`text-xs ${getDueDateColor(bill.dueDate)}`}>
                  {daysUntil < 0 && 'Overdue'}
                  {daysUntil === 0 && 'Today'}
                  {daysUntil === 1 && 'Tomorrow'}
                  {daysUntil > 1 && `${daysUntil} days`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {upcomingBills.length === 0 && (
        <div className="text-center py-6">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No upcoming bills</p>
        </div>
      )}
    </div>
  );
}
