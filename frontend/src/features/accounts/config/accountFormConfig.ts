import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['bank', 'card', 'wallet', 'cash'], {
    required_error: 'Account type is required',
  }),
  balance: z.number({
    required_error: 'Initial balance is required',
    invalid_type_error: 'Balance must be a number',
  }),
  currency: z.string().min(3).max(3),
  description: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

export function getAccountFormConfig(account?: any): FormConfig<AccountFormData> {
  return {
    title: account ? 'Edit Account' : 'Add Account',
    description: 'Manage your financial accounts',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Account Name',
            type: 'text',
            placeholder: 'e.g., Main Checking Account',
            required: true,
            description: 'Give your account a descriptive name',
          },
          {
            name: 'type',
            label: 'Account Type',
            type: 'select',
            required: true,
            options: [
              { value: 'bank', label: 'Bank Account' },
              { value: 'card', label: 'Credit/Debit Card' },
              { value: 'wallet', label: 'Digital Wallet' },
              { value: 'cash', label: 'Cash' },
            ],
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'balance',
            label: 'Initial Balance',
            type: 'currency',
            required: true,
            step: 0.01,
            description: 'Current balance of this account',
          },
          {
            name: 'currency',
            label: 'Currency',
            type: 'select',
            required: true,
            options: [
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'JPY', label: 'JPY (¥)' },
              { value: 'INR', label: 'INR (₹)' },
            ],
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
            placeholder: 'Add any additional details about this account...',
            rows: 3,
          },
        ],
      },
    ],
    schema: accountSchema,
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'bank',
      balance: account?.balance || 0,
      currency: account?.currency || 'USD',
      description: account?.description || '',
    },
  };
}
