import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { format, addDays, endOfMonth, endOfYear, addMonths } from 'date-fns';

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100),
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be positive'),
  period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom'], {
    required_error: 'Period is required',
  }),
  type: z.enum(['category', 'tag', 'overall', 'group'], {
    required_error: 'Type is required',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  groupId: z.string().optional(),
  alertEnabled: z.boolean().optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

function calculateEndDate(startDate: string, period: string): string {
  const start = new Date(startDate);
  switch (period) {
    case 'weekly':
      return format(addDays(start, 6), 'yyyy-MM-dd');
    case 'monthly':
      return format(endOfMonth(start), 'yyyy-MM-dd');
    case 'quarterly':
      return format(endOfMonth(addMonths(start, 2)), 'yyyy-MM-dd');
    case 'yearly':
      return format(endOfYear(start), 'yyyy-MM-dd');
    case 'custom':
      return format(start, 'yyyy-MM-dd');
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
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'overall', label: 'Overall' },
              { value: 'category', label: 'Category' },
              { value: 'tag', label: 'Tag' },
              { value: 'group', label: 'Group' },
            ],
          },
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
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'custom', label: 'Custom' },
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
        columns: 3,
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
            name: 'tagId',
            label: 'Tag',
            type: 'text',
            description: 'Optional: Apply budget to a specific tag (enter tag ID)',
          },
          {
            name: 'groupId',
            label: 'Group',
            type: 'text',
            description: 'Optional: Apply budget to a group (enter group ID)',
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
          {
            name: 'alertEnabled',
            label: 'Enable Alerts',
            type: 'switch',
          },
        ],
        columns: 4,
      },
      {
        fields: [
          {
            name: 'notes',
            label: 'Notes',
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
      type: budget?.type || (budget?.categoryId ? 'category' : 'overall'),
      startDate: budget?.startDate
        ? format(new Date(budget.startDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      endDate: budget?.endDate
        ? format(new Date(budget.endDate), 'yyyy-MM-dd')
        : calculateEndDate(format(new Date(), 'yyyy-MM-dd'), 'monthly'),
      categoryId: budget?.categoryId || '',
      tagId: budget?.tagId || '',
      groupId: budget?.groupId || '',
      alertEnabled: budget?.alertEnabled ?? false,
      alertThreshold: budget?.alertThreshold || 80,
      notes: budget?.notes || '',
    },
  };
}
