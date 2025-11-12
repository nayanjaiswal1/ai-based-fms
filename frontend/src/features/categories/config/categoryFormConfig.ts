import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  type: z.enum(['expense', 'income', 'both'], {
    required_error: 'Category type is required',
  }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export function getCategoryFormConfig(category?: any, categories?: any[]): FormConfig<CategoryFormData> {
  const parentCategories = categories?.filter(c => !c.parentId && c.id !== category?.id) || [];

  return {
    title: category ? 'Edit Category' : 'Add Category',
    description: 'Organize your transactions with categories',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Category Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Groceries, Salary',
          },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
              { value: 'both', label: 'Both' },
            ],
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'color',
            label: 'Color',
            type: 'color',
            required: true,
            description: 'Choose a color to identify this category',
          },
          {
            name: 'icon',
            label: 'Icon',
            type: 'text',
            placeholder: 'emoji or icon name',
          },
        ],
        columns: 2,
      },
      {
        fields: [
          {
            name: 'parentId',
            label: 'Parent Category',
            type: 'select',
            description: 'Optional: Create a subcategory',
            options: parentCategories.map(c => ({ value: c.id, label: c.name })),
          },
        ],
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
    schema: categorySchema,
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'expense',
      color: category?.color || '#3B82F6',
      icon: category?.icon || '',
      parentId: category?.parentId || '',
      description: category?.description || '',
    },
  };
}
