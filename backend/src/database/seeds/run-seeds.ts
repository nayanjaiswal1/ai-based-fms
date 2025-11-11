import { DataSource } from 'typeorm';
import { dataSourceOptions } from '@config/database.config';
import { seedDefaultCategories } from './default-categories.seed';
import { seedDefaultTags } from './default-tags.seed';

async function runSeeds() {
  console.log('Starting database seeding...');

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    await seedDefaultCategories(dataSource);
    await seedDefaultTags(dataSource);

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
