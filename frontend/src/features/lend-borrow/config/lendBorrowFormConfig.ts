import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format } from 'date-fns';

export const lendBorrowSchema = z.object({
  type: z.enum(['lend', 'borrow'], {
    required_error: 'Type is required',
  }),
  personName: z.string().min(1, 'Person name is required').max(200),
  personEmail: z.string().email().optional().or(z.literal('')),
  personPhone: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
});

export type LendBorrowFormData = z.infer<typeof lendBorrowSchema>;

export function getLendBorrowFormConfig(record?: any): FormConfig<LendBorrowFormData> {
  return {
    title: record ? 'Edit Record' : 'Add Lend/Borrow Record',
    description: 'Quick entry - just the essentials',
    sections: [
      {
        fields: [
          {
            name: 'type',
            label: 'Type',
            type: 'radio',
            required: true,
            options: [
              { value: 'lend', label: 'I Lent Money' },
              { value: 'borrow', label: 'I Borrowed Money' },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'personName',
            label: 'Person Name',
            type: 'text',
            required: true,
            placeholder: 'Who did you lend to / borrow from?',
          },
          {
            name: 'amount',
            label: 'Amount',
            type: 'currency',
            required: true,
            placeholder: '0.00',
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            required: true,
          },
        ],
      },
    ],
    schema: lendBorrowSchema,
    defaultValues: {
      type: record?.type || 'lend',
      personName: record?.personName || '',
      personEmail: record?.personEmail || '',
      personPhone: record?.personPhone || '',
      amount: record?.amount || 0,
      date: record?.date
        ? format(new Date(record.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      dueDate: record?.dueDate
        ? format(new Date(record.dueDate), 'yyyy-MM-dd')
        : '',
      description: record?.description || '',
    },
  };
}
