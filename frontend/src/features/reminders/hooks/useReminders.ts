import { useCrud } from '@hooks/useCrud';
import { remindersApi } from '@services/api';

export interface Reminder {
  id: string;
  title: string;
  amount?: number;
  reminderDate: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for managing reminders
 * Provides all CRUD operations and state management for reminders
 */
export function useReminders() {
  return useCrud<Reminder>({
    queryKey: 'reminders',
    api: remindersApi,
  });
}
