import { DataSource } from 'typeorm';
import { Category, CategoryType } from '../entities';

export const defaultCategories = [
  // Income Categories
  {
    name: 'Salary',
    type: CategoryType.INCOME,
    icon: '💰',
    color: '#10B981',
    isDefault: true,
    description: 'Monthly salary or wages',
  },
  {
    name: 'Freelance',
    type: CategoryType.INCOME,
    icon: '💼',
    color: '#3B82F6',
    isDefault: true,
    description: 'Freelance or contract work',
  },
  {
    name: 'Business',
    type: CategoryType.INCOME,
    icon: '🏢',
    color: '#8B5CF6',
    isDefault: true,
    description: 'Business income',
  },
  {
    name: 'Investments',
    type: CategoryType.INCOME,
    icon: '📈',
    color: '#06B6D4',
    isDefault: true,
    description: 'Investment returns and dividends',
  },
  {
    name: 'Gifts',
    type: CategoryType.INCOME,
    icon: '🎁',
    color: '#F59E0B',
    isDefault: true,
    description: 'Money received as gifts',
  },
  {
    name: 'Other Income',
    type: CategoryType.INCOME,
    icon: '💵',
    color: '#6366F1',
    isDefault: true,
    description: 'Other sources of income',
  },

  // Expense Categories
  {
    name: 'Food & Dining',
    type: CategoryType.EXPENSE,
    icon: '🍔',
    color: '#EF4444',
    isDefault: true,
    description: 'Food, groceries, and dining out',
    children: [
      { name: 'Groceries', icon: '🛒', color: '#DC2626' },
      { name: 'Restaurants', icon: '🍽️', color: '#F87171' },
      { name: 'Coffee & Tea', icon: '☕', color: '#FCA5A5' },
      { name: 'Fast Food', icon: '🍕', color: '#FEE2E2' },
    ],
  },
  {
    name: 'Transportation',
    type: CategoryType.EXPENSE,
    icon: '🚗',
    color: '#F59E0B',
    isDefault: true,
    description: 'Transport and vehicle expenses',
    children: [
      { name: 'Fuel', icon: '⛽', color: '#D97706' },
      { name: 'Public Transport', icon: '🚌', color: '#F59E0B' },
      { name: 'Taxi & Rideshare', icon: '🚕', color: '#FBBF24' },
      { name: 'Maintenance', icon: '🔧', color: '#FCD34D' },
    ],
  },
  {
    name: 'Shopping',
    type: CategoryType.EXPENSE,
    icon: '🛍️',
    color: '#EC4899',
    isDefault: true,
    description: 'Shopping and retail purchases',
    children: [
      { name: 'Clothing', icon: '👕', color: '#DB2777' },
      { name: 'Electronics', icon: '💻', color: '#F472B6' },
      { name: 'Home & Garden', icon: '🏠', color: '#F9A8D4' },
      { name: 'Gifts', icon: '🎁', color: '#FBE7F3' },
    ],
  },
  {
    name: 'Entertainment',
    type: CategoryType.EXPENSE,
    icon: '🎬',
    color: '#8B5CF6',
    isDefault: true,
    description: 'Entertainment and leisure',
    children: [
      { name: 'Movies & Shows', icon: '🎭', color: '#7C3AED' },
      { name: 'Games', icon: '🎮', color: '#A78BFA' },
      { name: 'Sports', icon: '⚽', color: '#C4B5FD' },
      { name: 'Hobbies', icon: '🎨', color: '#EDE9FE' },
    ],
  },
  {
    name: 'Healthcare',
    type: CategoryType.EXPENSE,
    icon: '⚕️',
    color: '#14B8A6',
    isDefault: true,
    description: 'Health and medical expenses',
    children: [
      { name: 'Doctor', icon: '👨‍⚕️', color: '#0D9488' },
      { name: 'Pharmacy', icon: '💊', color: '#2DD4BF' },
      { name: 'Insurance', icon: '🏥', color: '#5EEAD4' },
      { name: 'Fitness', icon: '💪', color: '#99F6E4' },
    ],
  },
  {
    name: 'Bills & Utilities',
    type: CategoryType.EXPENSE,
    icon: '📄',
    color: '#06B6D4',
    isDefault: true,
    description: 'Regular bills and utilities',
    children: [
      { name: 'Electricity', icon: '💡', color: '#0891B2' },
      { name: 'Water', icon: '💧', color: '#22D3EE' },
      { name: 'Internet', icon: '🌐', color: '#67E8F9' },
      { name: 'Phone', icon: '📱', color: '#A5F3FC' },
    ],
  },
  {
    name: 'Housing',
    type: CategoryType.EXPENSE,
    icon: '🏠',
    color: '#F97316',
    isDefault: true,
    description: 'Rent, mortgage, and housing costs',
    children: [
      { name: 'Rent', icon: '🔑', color: '#EA580C' },
      { name: 'Mortgage', icon: '🏦', color: '#FB923C' },
      { name: 'Maintenance', icon: '🔨', color: '#FDBA74' },
      { name: 'Property Tax', icon: '📋', color: '#FED7AA' },
    ],
  },
  {
    name: 'Education',
    type: CategoryType.EXPENSE,
    icon: '📚',
    color: '#3B82F6',
    isDefault: true,
    description: 'Education and learning expenses',
    children: [
      { name: 'Tuition', icon: '🎓', color: '#2563EB' },
      { name: 'Books', icon: '📖', color: '#60A5FA' },
      { name: 'Courses', icon: '💻', color: '#93C5FD' },
      { name: 'Supplies', icon: '✏️', color: '#DBEAFE' },
    ],
  },
  {
    name: 'Personal Care',
    type: CategoryType.EXPENSE,
    icon: '💅',
    color: '#A855F7',
    isDefault: true,
    description: 'Personal care and beauty',
    children: [
      { name: 'Haircut', icon: '💇', color: '#9333EA' },
      { name: 'Spa', icon: '🧖', color: '#C084FC' },
      { name: 'Cosmetics', icon: '💄', color: '#D8B4FE' },
    ],
  },
  {
    name: 'Travel',
    type: CategoryType.EXPENSE,
    icon: '✈️',
    color: '#10B981',
    isDefault: true,
    description: 'Travel and vacation expenses',
    children: [
      { name: 'Flights', icon: '🛫', color: '#059669' },
      { name: 'Hotels', icon: '🏨', color: '#34D399' },
      { name: 'Activities', icon: '🎢', color: '#6EE7B7' },
    ],
  },
  {
    name: 'Insurance',
    type: CategoryType.EXPENSE,
    icon: '🛡️',
    color: '#6366F1',
    isDefault: true,
    description: 'Insurance premiums',
  },
  {
    name: 'Taxes',
    type: CategoryType.EXPENSE,
    icon: '📊',
    color: '#EF4444',
    isDefault: true,
    description: 'Tax payments',
  },
  {
    name: 'Savings',
    type: CategoryType.EXPENSE,
    icon: '🏦',
    color: '#10B981',
    isDefault: true,
    description: 'Savings and investments',
  },
  {
    name: 'Debt Payment',
    type: CategoryType.EXPENSE,
    icon: '💳',
    color: '#F59E0B',
    isDefault: true,
    description: 'Loan and credit card payments',
  },
  {
    name: 'Charity',
    type: CategoryType.EXPENSE,
    icon: '❤️',
    color: '#EC4899',
    isDefault: true,
    description: 'Charitable donations',
  },
  {
    name: 'Other Expenses',
    type: CategoryType.EXPENSE,
    icon: '📝',
    color: '#6B7280',
    isDefault: true,
    description: 'Miscellaneous expenses',
  },
];

export async function seedDefaultCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);

  // Check if categories already exist
  const existingCount = await categoryRepository.count({ where: { isDefault: true } });
  if (existingCount > 0) {
    console.log('Default categories already exist, skipping seed');
    return;
  }

  console.log('Seeding default categories...');

  for (const categoryData of defaultCategories) {
    const { children, ...parentData } = categoryData as any;

    // Create parent category
    const parent = categoryRepository.create({
      ...parentData,
      userId: null,
    });
    const savedParent = await categoryRepository.save(parent);

    // Create children if they exist
    if (children && children.length > 0) {
      for (const childData of children) {
        const child = categoryRepository.create({
          ...childData,
          type: parentData.type,
          isDefault: true,
          userId: null,
          parent: savedParent,
        });
        await categoryRepository.save(child);
      }
    }
  }

  console.log('Default categories seeded successfully');
}
