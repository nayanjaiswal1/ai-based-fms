import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format } from 'date-fns';

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number().positive().optional(),
  reminderDate: z.string().min(1, 'Reminder date is required'),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly'], {
    required_error: 'Frequency is required',
  }),
  notes: z.string().optional(),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;

export function getReminderFormConfig(reminder?: any): FormConfig<ReminderFormData> {
  return {
    title: reminder ? 'Edit Reminder' : 'Add Reminder',
    description: 'Set up reminders for bills and recurring payments',
    sections: [
      {
        fields: [
          {
            name: 'title',
            label: 'Reminder Title',
            type: 'text',
            required: true,
            placeholder: 'e.g., Electricity Bill, Rent Payment',
          },
        ],
      },
      {
        fields: [
          {
            name: 'amount',
            label: 'Amount',
            type: 'currency',
            placeholder: '0.00',
            description: 'Optional: Expected amount for this reminder',
          },
          {
            name: 'reminderDate',
            label: 'Reminder Date',
            type: 'date',
            required: true,
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'frequency',
            label: 'Frequency',
            type: 'select',
            required: true,
            options: [
              { value: 'once', label: 'Once' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Add any additional notes...',
            rows: 3,
          },
        ],
      },
    ],
    schema: reminderSchema,
    defaultValues: {
      title: reminder?.title || '',
      amount: reminder?.amount || undefined,
      reminderDate: reminder?.reminderDate
        ? format(new Date(reminder.reminderDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      frequency: reminder?.frequency || 'once',
      notes: reminder?.notes || '',
    },
  };
}
