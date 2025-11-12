import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format } from 'date-fns';

export const lendBorrowSchema = z.object({
  type: z.enum(['lent', 'borrowed'], {
    required_error: 'Type is required',
  }),
  personName: z.string().min(1, 'Person name is required').max(200),
  amount: z.number().positive('Amount must be greater than 0'),
  dueDate: z.string().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export type LendBorrowFormData = z.infer<typeof lendBorrowSchema>;

export function getLendBorrowFormConfig(record?: any): FormConfig<LendBorrowFormData> {
  return {
    title: record ? 'Edit Record' : 'Add Lend/Borrow Record',
    description: 'Track money you lent or borrowed',
    sections: [
      {
        fields: [
          {
            name: 'type',
            label: 'Type',
            type: 'radio',
            required: true,
            options: [
              { value: 'lent', label: 'Lent (I gave money)' },
              { value: 'borrowed', label: 'Borrowed (I received money)' },
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
            placeholder: 'e.g., John Doe',
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
            name: 'dueDate',
            label: 'Due Date',
            type: 'date',
            description: 'Optional: When the money should be returned',
          },
          {
            name: 'interestRate',
            label: 'Interest Rate (%)',
            type: 'percentage',
            placeholder: 'e.g., 5.5',
            description: 'Optional: Annual interest rate',
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Add any additional details...',
            rows: 3,
          },
        ],
      },
    ],
    schema: lendBorrowSchema,
    defaultValues: {
      type: record?.type || 'lent',
      personName: record?.personName || '',
      amount: record?.amount || 0,
      dueDate: record?.dueDate
        ? format(new Date(record.dueDate), 'yyyy-MM-dd')
        : '',
      interestRate: record?.interestRate || undefined,
      description: record?.description || '',
    },
  };
}
