import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { usePreferencesStore } from '../../../stores/preferencesStore';

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['bank', 'wallet', 'cash', 'card', 'investment', 'other'], {
    required_error: 'Account type is required',
  }),
  balance: z.number({
    required_error: 'Initial balance is required',
    invalid_type_error: 'Balance must be a number',
  }),
  currency: z.string().min(3).max(3).optional(),
  description: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

export function getAccountFormConfig(account?: any): FormConfig<AccountFormData> {
  // Get user's currency preference
  const userCurrency = usePreferencesStore.getState().preferences.currency;

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
              { value: 'wallet', label: 'Digital Wallet' },
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'investment', label: 'Investment' },
              { value: 'other', label: 'Other' },
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
          // Currency field is hidden - uses user preference
        ],
        columns: 1,
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
      type: (account?.type as any) || 'bank',
      balance: account?.balance || 0,
      currency: account?.currency || userCurrency, // Use user preference
      description: account?.description || '',
    },
  };
}
