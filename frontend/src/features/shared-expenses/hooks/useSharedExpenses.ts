import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sharedExpensesApi } from '@/services/api';
import {
  SharedExpenseGroup,
  SharedExpenseDisplayData,
  DebtDirection,
} from '../types';
import { getCurrencySymbol } from '@/stores/preferencesStore';

export function useSharedExpenses(filters?: {
  isOneToOne?: boolean;
  type?: string;
}) {
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ['shared-expenses', filters],
    queryFn: () => sharedExpensesApi.getAll(filters),
  });

  // Transform for display
  const displayExpenses = useMemo<SharedExpenseDisplayData[]>(() => {
    if (!expenses) return [];

    return expenses.map((expense: SharedExpenseGroup) => {
      if (expense.isOneToOne) {
        const userParticipant = expense.participants?.find(
          (p) => p.userId !== null,
        );
        const balance = userParticipant?.balance || 0;

        return {
          ...expense,
          displayName: expense.otherPersonName || 'Unknown',
          displaySubtitle: getDebtSubtitle(balance, expense),
          iconType: 'person' as const,
          iconColor: getDebtColor(expense.debtDirection),
          sortKey: (expense.otherPersonName || '').toLowerCase(),
        };
      } else {
        return {
          ...expense,
          displayName: expense.name,
          displaySubtitle: `${expense.participantCount} people`,
          iconType: 'group' as const,
          iconColor: 'blue',
          sortKey: expense.name.toLowerCase(),
        };
      }
    });
  }, [expenses]);

  return {
    expenses: displayExpenses,
    isLoading,
    error,
  };
}

function getDebtSubtitle(balance: number, expense: SharedExpenseGroup): string {
  const absBalance = Math.abs(balance);

  if (balance > 0) {
    return `Owes you ${getCurrencySymbol()}${absBalance.toFixed(2)}`;
  } else if (balance < 0) {
    return `You owe ${getCurrencySymbol()}${absBalance.toFixed(2)}`;
  } else {
    return 'Settled';
  }
}

function getDebtColor(direction?: DebtDirection): string {
  if (!direction) return 'gray';
  return direction === DebtDirection.LEND ? 'green' : 'red';
}

export function useConsolidatedDebts() {
  return useQuery({
    queryKey: ['shared-expenses', 'consolidated'],
    queryFn: sharedExpensesApi.getConsolidatedDebts,
  });
}
