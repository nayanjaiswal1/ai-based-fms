import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

export const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(200),
  description: z.string().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters'),
});

export type GroupFormData = z.infer<typeof groupSchema>;

export function getGroupFormConfig(group?: any): FormConfig<GroupFormData> {
  return {
    title: group ? 'Edit Group' : 'Create Group',
    description: 'Manage shared expenses with groups',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Group Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Roommates, Trip to Paris',
          },
        ],
      },
      {
        fields: [
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Add details about this group...',
            rows: 3,
            description: 'Optional: Add notes about this group',
          },
        ],
      },
      {
        fields: [
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
      },
    ],
    schema: groupSchema,
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      currency: group?.currency || 'USD',
    },
  };
}
