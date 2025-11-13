import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, SubscriptionTier } from '@database/entities';

/**
 * Seed an admin user
 * This will create a default admin user if one doesn't exist
 * You can customize the admin details via environment variables
 */
export async function seedAdminUser(dataSource: DataSource) {
  console.log('Seeding admin user...');

  const userRepository = dataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { role: UserRole.ADMIN },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
    return existingAdmin;
  }

  // Get admin details from environment variables or use defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

  // Check if email is already registered (but not as admin)
  const existingUser = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingUser) {
    // Upgrade existing user to admin
    existingUser.role = UserRole.ADMIN;
    existingUser.subscriptionTier = SubscriptionTier.ENTERPRISE;
    existingUser.isActive = true;
    existingUser.emailVerified = true;
    await userRepository.save(existingUser);
    console.log('✅ Upgraded existing user to admin:', existingUser.email);
    return existingUser;
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = userRepository.create({
    email: adminEmail,
    password: hashedPassword,
    firstName: adminFirstName,
    lastName: adminLastName,
    role: UserRole.ADMIN,
    subscriptionTier: SubscriptionTier.ENTERPRISE,
    isActive: true,
    emailVerified: true,
    language: 'en',
    region: 'US',
    currency: 'USD',
  });

  await userRepository.save(adminUser);

  console.log('✅ Admin user created successfully!');
  console.log('📧 Email:', adminEmail);
  console.log('🔑 Password:', adminPassword);
  console.log('⚠️  IMPORTANT: Change the admin password after first login!');

  return adminUser;
}
