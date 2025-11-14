import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';
import { usePreferencesStore } from '../../../stores/preferencesStore';

export const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(200),
  description: z.string().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
});

export type GroupFormData = z.infer<typeof groupSchema>;

export function getGroupFormConfig(group?: any): FormConfig<GroupFormData> {
  // Get user's currency preference
  const userCurrency = usePreferencesStore.getState().preferences.currency;

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
      // Currency field is hidden - uses user preference
    ],
    schema: groupSchema,
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      currency: group?.currency || userCurrency, // Use user preference
    },
  };
}
