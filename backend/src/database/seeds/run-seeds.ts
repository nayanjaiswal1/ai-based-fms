import { DataSource } from 'typeorm';
import { dataSourceOptions } from '@config/database.config';
import { seedDefaultCategories } from './default-categories.seed';
import { seedDefaultTags } from './default-tags.seed';
import { seedAdminUser } from './admin-user.seed';

async function runSeeds() {
  console.log('Starting database seeding...');

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    // Seed default data
    await seedDefaultCategories(dataSource);
    await seedDefaultTags(dataSource);

    // Seed admin user (optional - controlled by SEED_ADMIN env variable)
    if (process.env.SEED_ADMIN === 'true') {
      await seedAdminUser(dataSource);
    } else {
      console.log('⚠️  Skipping admin user seed (set SEED_ADMIN=true to enable)');
      console.log('💡 You can create an admin user manually with: npm run create-admin');
    }

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
