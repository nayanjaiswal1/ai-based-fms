# Admin User Setup Guide

This guide explains how to create and configure admin users for your Finance Management System.

## Table of Contents

1. [Understanding User Roles](#understanding-user-roles)
2. [Method 1: Interactive CLI Tool (Recommended)](#method-1-interactive-cli-tool-recommended)
3. [Method 2: Automatic Seeding](#method-2-automatic-seeding)
4. [Method 3: Direct Database Insert](#method-3-direct-database-insert)
5. [Method 4: Upgrade Existing User](#method-4-upgrade-existing-user)
6. [Admin User Permissions](#admin-user-permissions)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Understanding User Roles

The Finance Management System has two user roles:

| Role | Description | Subscription Tier |
|------|-------------|-------------------|
| **USER** | Regular user with access to personal finance features | FREE, BASIC, PREMIUM |
| **ADMIN** | Administrator with full system access and management capabilities | ENTERPRISE (auto-assigned) |

Admin users automatically receive:
- `role: ADMIN`
- `subscriptionTier: ENTERPRISE`
- `isActive: true`
- `emailVerified: true`
- Full access to all features
- Access to admin-only endpoints

---

## Method 1: Interactive CLI Tool (Recommended)

The easiest and safest way to create an admin user is using the interactive CLI tool.

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Run the Admin Creation Tool

```bash
npm run create-admin
```

### Step 3: Follow the Interactive Prompts

The tool will ask you for:

1. **Admin Email**: Must be a valid email format
   - Example: `admin@yourdomain.com`

2. **First Name**: Admin's first name
   - Default: `Admin`

3. **Last Name**: Admin's last name
   - Default: `User`

4. **Password**: Must meet security requirements:
   - At least 8 characters
   - At least 1 uppercase letter (A-Z)
   - At least 1 lowercase letter (a-z)
   - At least 1 number (0-9)
   - At least 1 special character (@$!%*?&)
   - Example: `SecureAdmin@123`

5. **Confirm Password**: Re-enter password to confirm

### Example Session

```bash
$ npm run create-admin

🔐 Admin User Creation Tool

This tool will help you create an admin user for your Finance Management System.

📡 Connecting to database...
✅ Connected to database

Enter admin email: admin@company.com
Enter first name (default: Admin): John
Enter last name (default: User): Smith
Enter password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special): SuperSecure@2024
Confirm password: SuperSecure@2024

🔐 Hashing password...

✅ Admin user created successfully!

📋 Admin User Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:      admin@company.com
👤 Name:       John Smith
🔑 Role:       ADMIN
💎 Tier:       ENTERPRISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 You can now login with these credentials!
```

### Features

- ✅ Email format validation
- ✅ Password strength validation
- ✅ Checks if email already exists
- ✅ Can upgrade existing users to admin
- ✅ Can reset admin passwords
- ✅ Interactive and user-friendly
- ✅ Secure password handling

---

## Method 2: Automatic Seeding

Create admin users automatically during database seeding.

### Step 1: Configure Environment Variables

Edit your `backend/.env` file:

```bash
# Enable admin seeding
SEED_ADMIN=true

# Admin credentials
ADMIN_EMAIL=admin@fms.com
ADMIN_PASSWORD=YourSecurePassword@123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### Step 2: Run Database Seeds

```bash
cd backend
npm run seed
```

### Output

```bash
Starting database seeding...
Seeding default categories...
✅ Default categories seeded
Seeding default tags...
✅ Default tags seeded
Seeding admin user...
✅ Admin user created successfully!
📧 Email: admin@fms.com
🔑 Password: YourSecurePassword@123
⚠️  IMPORTANT: Change the admin password after first login!
All seeds completed successfully
```

### Notes

- If `SEED_ADMIN=false` or not set, admin seeding is skipped
- If admin already exists, it will be reported and skipped
- Credentials are taken from environment variables
- Less secure than interactive method (credentials in .env file)

---

## Method 3: Direct Database Insert

For advanced users who want to create admin users directly via SQL.

### Step 1: Generate Password Hash

You need to hash the password first. Create a small Node.js script:

```javascript
// hash-password.js
const bcrypt = require('bcrypt');

const password = 'YourSecurePassword@123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password hash:', hash);
```

Run it:

```bash
cd backend
node hash-password.js
```

### Step 2: Insert into Database

Connect to your PostgreSQL database and run:

```sql
INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "subscriptionTier",
  "isActive",
  "emailVerified",
  language,
  region,
  currency,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@fms.com',
  '$2b$10$...your.hashed.password.here...',  -- Replace with hash from Step 1
  'Admin',
  'User',
  'admin',
  'enterprise',
  true,
  true,
  'en',
  'US',
  'USD',
  NOW(),
  NOW()
);
```

### Verify

```sql
SELECT email, role, "subscriptionTier" FROM users WHERE role = 'admin';
```

---

## Method 4: Upgrade Existing User

Upgrade an existing regular user to admin status.

### Using the CLI Tool

The CLI tool automatically detects existing users:

```bash
npm run create-admin

Enter admin email: existing.user@company.com
⚠️  This email exists as a regular user. Upgrade to admin? (yes/no): yes
✅ User upgraded to admin successfully!
```

### Using SQL

```sql
UPDATE users
SET
  role = 'admin',
  "subscriptionTier" = 'enterprise',
  "isActive" = true,
  "emailVerified" = true
WHERE email = 'user@company.com';
```

### Verify

```sql
SELECT email, role, "subscriptionTier" FROM users WHERE email = 'user@company.com';
```

---

## Admin User Permissions

Admin users have access to special endpoints and features:

### Admin-Only Endpoints

```typescript
// Examples from the backend
GET    /api/admin/users          // List all users
GET    /api/admin/users/:id      // Get user details
PUT    /api/admin/users/:id      // Update user
DELETE /api/admin/users/:id      // Delete user
POST   /api/admin/users/:id/ban  // Ban user
GET    /api/admin/analytics      // System analytics
GET    /api/admin/audit-logs     // Audit trail
```

### Frontend Features

- Access to Admin Dashboard
- User management interface
- System analytics and reports
- Audit log viewer
- Subscription management
- System configuration

### Role-Based Access Control

The system uses the `@Roles()` decorator to protect admin routes:

```typescript
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@database/entities';

@Get('users')
@Roles(UserRole.ADMIN)
async getAllUsers() {
  // Only accessible by admin users
}
```

---

## Security Best Practices

### 1. Strong Passwords

Always use strong passwords for admin accounts:

✅ **Good**: `SuperSecure@2024!AdminPass`
❌ **Bad**: `admin123`, `password`, `12345678`

Requirements:
- Minimum 8 characters
- Mix of uppercase and lowercase
- Include numbers
- Include special characters
- Avoid dictionary words

### 2. Change Default Credentials

If you used automatic seeding with default credentials:

1. Login with default credentials
2. Go to Profile Settings
3. Change password immediately
4. Remove credentials from .env file

### 3. Limit Admin Accounts

- Create only necessary admin accounts
- Use regular user accounts for daily work
- Only use admin account when needed

### 4. Use Environment-Specific Credentials

```bash
# Development
ADMIN_EMAIL=admin@dev.local
ADMIN_PASSWORD=DevPassword@123

# Production
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=ProductionSecurePass@2024!
```

### 5. Enable Two-Factor Authentication

After creating admin account:

1. Login to the system
2. Go to Security Settings
3. Enable 2FA
4. Save backup codes securely

### 6. Monitor Admin Activity

- Regularly check audit logs
- Review admin actions
- Set up alerts for suspicious activity

### 7. Secure .env Files

```bash
# Never commit .env files
echo ".env" >> .gitignore

# Set proper file permissions
chmod 600 .env

# Use environment variables in production
# Don't rely on .env files in production
```

---

## Troubleshooting

### Issue: "Email already registered"

**Solution**: The email is already in use. Either:
- Use a different email
- Use the CLI tool to upgrade existing user
- Delete the existing user first (if it's a mistake)

```sql
-- Check existing user
SELECT * FROM users WHERE email = 'admin@fms.com';

-- Delete if needed
DELETE FROM users WHERE email = 'admin@fms.com';
```

### Issue: "Cannot connect to database"

**Solution**: Check database configuration:

1. Verify database is running:
   ```bash
   psql -h localhost -U fms_user -d fms_db
   ```

2. Check .env configuration:
   ```bash
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=fms_user
   DATABASE_PASSWORD=fms_password
   DATABASE_NAME=fms_db
   ```

3. Test connection:
   ```bash
   npm run typeorm -- query "SELECT 1"
   ```

### Issue: "Password does not meet requirements"

**Solution**: Your password must include:
- At least 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

Examples of valid passwords:
- `SecurePass@123`
- `Admin2024!Strong`
- `MyP@ssw0rd2024`

### Issue: "Admin user created but can't login"

**Solution**: Check the following:

1. Verify admin exists in database:
   ```sql
   SELECT email, role, "isActive" FROM users WHERE role = 'admin';
   ```

2. Check if account is active:
   ```sql
   UPDATE users SET "isActive" = true WHERE email = 'admin@fms.com';
   ```

3. Verify password (try resetting):
   ```bash
   npm run create-admin
   # Enter same email and choose to reset password
   ```

4. Check backend logs for errors:
   ```bash
   npm run start:dev
   # Look for authentication errors
   ```

### Issue: "CLI tool hangs or doesn't respond"

**Solution**:

1. Press Ctrl+C to cancel
2. Check if another instance is running
3. Try again with verbose logging:
   ```bash
   DEBUG=* npm run create-admin
   ```

### Issue: "TypeORM errors during seeding"

**Solution**:

1. Run migrations first:
   ```bash
   npm run migration:run
   ```

2. Check if users table exists:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_name = 'users';
   ```

3. If table doesn't exist, run migrations:
   ```bash
   npm run migration:run
   ```

---

## Quick Reference

### Commands

```bash
# Interactive admin creation (recommended)
npm run create-admin

# Automatic seeding
SEED_ADMIN=true npm run seed

# Run all seeds
npm run seed

# Check existing admins
psql -d fms_db -c "SELECT email, role FROM users WHERE role = 'admin';"
```

### Environment Variables

```bash
# In backend/.env
SEED_ADMIN=true
ADMIN_EMAIL=admin@fms.com
ADMIN_PASSWORD=SecurePass@123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### Default Credentials (if using seeding)

```
Email: admin@fms.com
Password: Admin@123
```

⚠️ **IMPORTANT**: Change these immediately after first login!

---

## Next Steps

After creating your admin user:

1. ✅ Login to the system with admin credentials
2. ✅ Change the default password
3. ✅ Enable two-factor authentication
4. ✅ Update your profile information
5. ✅ Configure system settings
6. ✅ Create additional users if needed
7. ✅ Review security settings

---

## Support

If you encounter issues not covered in this guide:

1. Check the application logs
2. Review the [main README](./README.md)
3. Check database connectivity
4. Verify environment variables
5. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Environment details

---

## Summary

**Best Method**: Use `npm run create-admin` for interactive, secure admin creation.

**Quick Setup**: Set `SEED_ADMIN=true` in .env and run `npm run seed`.

**Security**: Always use strong passwords and change defaults immediately.

**Troubleshooting**: Check database connection, verify migrations, and review logs.
