import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSharedExpenses } from '../hooks/useSharedExpenses';
import { SharedExpenseDisplayData } from '../types';
import { getCurrencySymbol } from '@/stores/preferencesStore';

interface SharedExpensesListProps {
  filter?: 'all' | 'debts' | 'groups';
}

export function SharedExpensesList({ filter = 'all' }: SharedExpensesListProps) {
  const navigate = useNavigate();

  const filterParams =
    filter === 'debts'
      ? { isOneToOne: true }
      : filter === 'groups'
        ? { isOneToOne: false }
        : undefined;

  const { expenses, isLoading, error } = useSharedExpenses(filterParams);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">Error loading expenses</div>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">No expenses found</div>
      </div>
    );
  }

  const handleClick = (expense: SharedExpenseDisplayData) => {
    navigate(`/shared-expenses/${expense.id}`);
  };

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          onClick={() => handleClick(expense)}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="flex items-center gap-4 p-4">
            {/* Icon */}
            <Avatar
              className={`bg-${expense.iconColor}-100`}
              style={{
                backgroundColor: `var(--${expense.iconColor}-100, #e5e7eb)`,
              }}
            >
              <AvatarFallback>
                {expense.iconType === 'person' ? (
                  <UserIcon
                    className={`text-${expense.iconColor}-600`}
                    style={{ color: `var(--${expense.iconColor}-600, #4b5563)` }}
                  />
                ) : (
                  <UsersIcon className="text-blue-600" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Name & Subtitle */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{expense.displayName}</h3>
              <p className="text-sm text-gray-500 truncate">
                {expense.displaySubtitle}
              </p>
            </div>

            {/* Balance/Status Badge */}
            <div className="flex items-center gap-2">
              {expense.isOneToOne && (
                <Badge
                  variant="outline"
                  className="text-xs whitespace-nowrap"
                >
                  1-to-1
                </Badge>
              )}
              <Badge
                variant={getBalanceVariant(expense)}
                className="text-sm font-bold whitespace-nowrap"
              >
                {formatBalance(expense)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getBalanceVariant(expense: SharedExpenseDisplayData): 'default' | 'secondary' | 'outline' {
  if (!expense.isOneToOne) return 'default';

  const userParticipant = expense.participants?.find((p) => p.userId !== null);
  const balance = userParticipant?.balance || 0;

  if (balance > 0) return 'default'; // Owed to you (positive)
  if (balance < 0) return 'secondary'; // You owe (negative)
  return 'outline'; // Settled
}

function formatBalance(expense: SharedExpenseDisplayData): string {
  if (!expense.isOneToOne) {
    // For groups, show total expenses or participant count
    return `${expense.participantCount} members`;
  }

  const userParticipant = expense.participants?.find((p) => p.userId !== null);
  const balance = userParticipant?.balance || 0;
  const absBalance = Math.abs(balance);

  if (balance === 0) return 'Settled';

  return `${getCurrencySymbol()}${absBalance.toFixed(2)}`;
}
