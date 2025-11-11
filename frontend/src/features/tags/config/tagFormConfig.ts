import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  description: z.string().optional(),
});

export type TagFormData = z.infer<typeof tagSchema>;

export function getTagFormConfig(tag?: any): FormConfig<TagFormData> {
  return {
    title: tag ? 'Edit Tag' : 'Create Tag',
    description: 'Tags help you organize and filter transactions',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Tag Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Business, Personal, Urgent',
          },
          {
            name: 'color',
            label: 'Color',
            type: 'color',
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
            type: 'textarea',
            placeholder: 'Add a description...',
            rows: 2,
          },
        ],
      },
    ],
    schema: tagSchema,
    defaultValues: {
      name: tag?.name || '',
      color: tag?.color || '#10B981',
      description: tag?.description || '',
    },
  };
}
