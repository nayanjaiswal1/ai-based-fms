#!/usr/bin/env ts-node
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, SubscriptionTier } from '../database/entities';
import { dataSourceOptions } from '../config/database.config';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

async function createAdminUser() {
  console.log('\n🔐 Admin User Creation Tool\n');
  console.log('This tool will help you create an admin user for your Finance Management System.\n');

  const dataSource = new DataSource(dataSourceOptions);

  try {
    console.log('📡 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    const userRepository = dataSource.getRepository(User);

    // Get email
    let email = '';
    while (!email) {
      email = await question('Enter admin email: ');
      if (!validateEmail(email)) {
        console.log('❌ Invalid email format. Please try again.');
        email = '';
      } else {
        // Check if email exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
          if (existingUser.role === UserRole.ADMIN) {
            console.log('❌ An admin user with this email already exists.');
            const upgrade = await question('Do you want to reset this admin password? (yes/no): ');
            if (upgrade.toLowerCase() !== 'yes') {
              email = '';
              continue;
            }
          } else {
            const upgrade = await question(
              '⚠️  This email exists as a regular user. Upgrade to admin? (yes/no): ',
            );
            if (upgrade.toLowerCase() !== 'yes') {
              email = '';
              continue;
            }
          }
        }
      }
    }

    // Get first name
    const firstName = (await question('Enter first name (default: Admin): ')) || 'Admin';

    // Get last name
    const lastName = (await question('Enter last name (default: User): ')) || 'User';

    // Get password
    let password = '';
    while (!password) {
      password = await question(
        'Enter password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special): ',
      );
      if (!validatePassword(password)) {
        console.log('❌ Password does not meet requirements. Please try again.');
        console.log('   - At least 8 characters');
        console.log('   - At least 1 uppercase letter');
        console.log('   - At least 1 lowercase letter');
        console.log('   - At least 1 number');
        console.log('   - At least 1 special character (@$!%*?&)');
        password = '';
      }
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match. Aborting.');
      process.exit(1);
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists and update or create
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      // Update existing user
      existingUser.password = hashedPassword;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.role = UserRole.ADMIN;
      existingUser.subscriptionTier = SubscriptionTier.ENTERPRISE;
      existingUser.isActive = true;
      existingUser.emailVerified = true;

      await userRepository.save(existingUser);
      console.log('\n✅ User upgraded to admin successfully!');
    } else {
      // Create new admin user
      const adminUser = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.ADMIN,
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        isActive: true,
        emailVerified: true,
        language: 'en',
        region: 'US',
        currency: 'USD',
      });

      await userRepository.save(adminUser);
      console.log('\n✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:      ${email}`);
    console.log(`👤 Name:       ${firstName} ${lastName}`);
    console.log(`🔑 Role:       ADMIN`);
    console.log(`💎 Tier:       ENTERPRISE`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 You can now login with these credentials!\n');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await dataSource.destroy();
  }
}

// Run the script
createAdminUser();
