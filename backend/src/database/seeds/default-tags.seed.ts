import { DataSource } from 'typeorm';
import { Tag } from '../entities';

export const defaultTags = [
  { name: 'Business', color: '#3B82F6', description: 'Business-related expenses' },
  { name: 'Personal', color: '#10B981', description: 'Personal expenses' },
  { name: 'Work', color: '#8B5CF6', description: 'Work-related expenses' },
  { name: 'Essential', color: '#EF4444', description: 'Essential and necessary expenses' },
  { name: 'Luxury', color: '#F59E0B', description: 'Luxury or discretionary expenses' },
  { name: 'Recurring', color: '#06B6D4', description: 'Recurring monthly expenses' },
  { name: 'One-time', color: '#EC4899', description: 'One-time purchases' },
  { name: 'Family', color: '#F97316', description: 'Family-related expenses' },
  { name: 'Emergency', color: '#DC2626', description: 'Emergency expenses' },
  { name: 'Investment', color: '#059669', description: 'Investment-related' },
  { name: 'Tax-deductible', color: '#7C3AED', description: 'Tax-deductible expenses' },
  { name: 'Reimbursable', color: '#2563EB', description: 'Expenses that can be reimbursed' },
  { name: 'Cash', color: '#6B7280', description: 'Cash payments' },
  { name: 'Online', color: '#0891B2', description: 'Online purchases' },
  { name: 'Subscription', color: '#DB2777', description: 'Subscription services' },
];

export async function seedDefaultTags(dataSource: DataSource) {
  const tagRepository = dataSource.getRepository(Tag);

  // Check if tags already exist
  const existingCount = await tagRepository.count({ where: { isDefault: true } });
  if (existingCount > 0) {
    console.log('Default tags already exist, skipping seed');
    return;
  }

  console.log('Seeding default tags...');

  for (const tagData of defaultTags) {
    const tag = tagRepository.create({
      ...tagData,
      isDefault: true,
      userId: null,
    });
    await tagRepository.save(tag);
  }

  console.log('Default tags seeded successfully');
}
