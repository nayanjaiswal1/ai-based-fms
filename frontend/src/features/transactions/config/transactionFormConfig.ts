import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format } from 'date-fns';

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income'], {
    required_error: 'Transaction type is required',
  }),
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(200),
  date: z.string().min(1, 'Date is required'),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().min(1, 'Category is required'),
  tagIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export function getTransactionFormConfig(
  transaction?: any,
  accounts?: any[],
  categories?: any[],
  tags?: any[]
): FormConfig<TransactionFormData> {
  return {
    title: transaction ? 'Edit Transaction' : 'Add Transaction',
    description: 'Track your income and expenses',
    sections: [
      {
        title: 'Transaction Details',
        fields: [
          {
            name: 'type',
            label: 'Type',
            type: 'radio',
            required: true,
            options: [
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'amount',
            label: 'Amount',
            type: 'currency',
            required: true,
            step: 0.01,
            placeholder: '0.00',
          },
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            required: true,
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            required: true,
            placeholder: 'What was this transaction for?',
          },
        ],
      },
      {
        fields: [
          {
            name: 'accountId',
            label: 'Account',
            type: 'select',
            required: true,
            options: accounts?.map(a => ({ value: a.id, label: a.name })) || [],
          },
          {
            name: 'categoryId',
            label: 'Category',
            type: 'select',
            required: true,
            options: categories?.map(c => ({ value: c.id, label: c.name })) || [],
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'tagIds',
            label: 'Tags',
            type: 'multiselect',
            description: 'Select one or more tags (optional)',
            options: tags?.map(t => ({
              value: t.id,
              label: t.name,
              color: t.color,
            })) || [],
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
    schema: transactionSchema,
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      date: transaction?.date
        ? format(new Date(transaction.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      accountId: transaction?.accountId || '',
      categoryId: transaction?.categoryId || '',
      tagIds: transaction?.tags?.map((t: any) => t.id) || [],
      notes: transaction?.notes || '',
    },
  };
}
