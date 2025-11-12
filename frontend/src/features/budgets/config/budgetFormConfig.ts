import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format, addDays, endOfMonth, endOfYear, addMonths, addYears } from 'date-fns';

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100),
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be positive'),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
    required_error: 'Period is required',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  categoryId: z.string().optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

function calculateEndDate(startDate: string, period: string): string {
  const start = new Date(startDate);
  switch (period) {
    case 'daily':
      return format(start, 'yyyy-MM-dd');
    case 'weekly':
      return format(addDays(start, 6), 'yyyy-MM-dd');
    case 'monthly':
      return format(endOfMonth(start), 'yyyy-MM-dd');
    case 'quarterly':
      return format(endOfMonth(addMonths(start, 2)), 'yyyy-MM-dd');
    case 'yearly':
      return format(endOfYear(start), 'yyyy-MM-dd');
    default:
      return format(start, 'yyyy-MM-dd');
  }
}

export function getBudgetFormConfig(budget?: any, categories?: any[]): FormConfig<BudgetFormData> {
  return {
    title: budget ? 'Edit Budget' : 'Create Budget',
    description: 'Set spending limits for your finances',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Budget Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Monthly Groceries',
          },
        ],
      },
      {
        fields: [
          {
            name: 'amount',
            label: 'Budget Amount',
            type: 'currency',
            required: true,
            step: 0.01,
            placeholder: '0.00',
          },
          {
            name: 'period',
            label: 'Period',
            type: 'select',
            required: true,
            options: [
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ],
            onChange: (value, form) => {
              const startDate = form.getValues('startDate');
              if (startDate) {
                const newEndDate = calculateEndDate(startDate, value);
                form.setValue('endDate', newEndDate);
              }
            },
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            required: true,
            onChange: (value, form) => {
              const period = form.getValues('period');
              if (period) {
                const newEndDate = calculateEndDate(value, period);
                form.setValue('endDate', newEndDate);
              }
            },
          },
          {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            required: true,
            readonly: true,
            description: 'Auto-calculated based on period',
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'categoryId',
            label: 'Category',
            type: 'select',
            description: 'Optional: Limit budget to a specific category',
            options: categories?.map(c => ({ value: c.id, label: c.name })) || [],
          },
          {
            name: 'alertThreshold',
            label: 'Alert Threshold (%)',
            type: 'percentage',
            min: 0,
            max: 100,
            step: 5,
            placeholder: '80',
            description: 'Get notified when you reach this %',
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
            placeholder: 'Add notes about this budget...',
            rows: 2,
          },
        ],
      },
    ],
    schema: budgetSchema,
    defaultValues: {
      name: budget?.name || '',
      amount: budget?.amount || 0,
      period: budget?.period || 'monthly',
      startDate: budget?.startDate
        ? format(new Date(budget.startDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      endDate: budget?.endDate
        ? format(new Date(budget.endDate), 'yyyy-MM-dd')
        : calculateEndDate(format(new Date(), 'yyyy-MM-dd'), 'monthly'),
      categoryId: budget?.categoryId || '',
      alertThreshold: budget?.alertThreshold || 80,
      description: budget?.description || '',
    },
  };
}
