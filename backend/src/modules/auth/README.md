# Auth Module

## Overview
The Auth module handles user authentication, authorization, and session management for the Finance Management System. It implements JWT-based authentication with secure httpOnly cookies, 2FA support, and OAuth integration.

## Features
- Email/password registration and login
- JWT access and refresh tokens
- Secure httpOnly cookie storage
- Two-Factor Authentication (2FA) with TOTP
- Google OAuth integration
- Password reset flow
- Session management
- Role-based access control (RBAC)
- Account verification

## Module Structure

```
auth/
├── auth.module.ts              # Module definition
├── auth.controller.ts          # Authentication endpoints
├── auth.service.ts             # Authentication logic
├── strategies/                 # Passport strategies
│   ├── jwt.strategy.ts         # JWT validation
│   ├── local.strategy.ts       # Username/password
│   └── google.strategy.ts      # Google OAuth
├── guards/                     # Auth guards
│   ├── jwt-auth.guard.ts       # JWT authentication
│   ├── local-auth.guard.ts     # Local authentication
│   ├── roles.guard.ts          # Role-based access
│   └── 2fa.guard.ts            # 2FA validation
├── dto/                        # Data Transfer Objects
│   ├── register.dto.ts         # Registration data
│   ├── login.dto.ts            # Login credentials
│   ├── reset-password.dto.ts   # Password reset
│   └── enable-2fa.dto.ts       # 2FA setup
└── README.md                   # This file
```

## User Roles
- **USER** - Standard user (default)
- **ADMIN** - Administrator with full access
- **PREMIUM** - Premium subscription user

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "currency": "USD",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your email.",
  "userId": "uuid",
  "email": "user@example.com"
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "has2FA": false
  },
  "requiresTwoFactor": false
}
```

**Note:** Access and refresh tokens are set as httpOnly cookies.

### POST /api/auth/login/2fa
Complete login with 2FA code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### POST /api/auth/logout
Logout and invalidate tokens.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

**Note:** New access token set in httpOnly cookie.

### GET /api/auth/profile
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "subscription": {
    "tier": "FREE",
    "expiresAt": null
  },
  "has2FA": true,
  "emailVerified": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PATCH /api/auth/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "currency": "EUR",
  "timezone": "Europe/London"
}
```

### POST /api/auth/change-password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword789!"
}
```

### POST /api/auth/verify-email
Verify email address.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

### GET /api/auth/google
Initiate Google OAuth flow.

Redirects to Google consent screen.

### GET /api/auth/google/callback
Google OAuth callback.

Handles OAuth callback and creates/authenticates user.

## Two-Factor Authentication (2FA)

### POST /api/auth/2fa/enable
Enable 2FA for user account.

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "backupCodes": [
    "12345678",
    "87654321",
    "11223344"
  ]
}
```

### POST /api/auth/2fa/verify
Verify and activate 2FA.

**Request Body:**
```json
{
  "code": "123456"
}
```

### POST /api/auth/2fa/disable
Disable 2FA.

**Request Body:**
```json
{
  "password": "UserPassword123!",
  "code": "123456"
}
```

### POST /api/auth/2fa/backup-codes
Generate new backup codes.

**Response:**
```json
{
  "backupCodes": [
    "98765432",
    "23456789",
    "34567890"
  ]
}
```

## Database Entity

**Table:** `users`

**Fields:**
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed with bcrypt)
- `name` (VARCHAR)
- `role` (ENUM: USER, ADMIN, PREMIUM)
- `emailVerified` (BOOLEAN, default: false)
- `emailVerificationToken` (VARCHAR, nullable)
- `resetPasswordToken` (VARCHAR, nullable)
- `resetPasswordExpires` (TIMESTAMP, nullable)
- `twoFactorSecret` (VARCHAR, nullable, encrypted)
- `twoFactorEnabled` (BOOLEAN, default: false)
- `twoFactorBackupCodes` (JSON, nullable, encrypted)
- `currency` (VARCHAR, default: 'USD')
- `timezone` (VARCHAR, default: 'UTC')
- `lastLoginAt` (TIMESTAMP, nullable)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Security Features

### Password Security
- **Hashing**: bcrypt with salt rounds = 10
- **Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### JWT Tokens
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- **Storage**: httpOnly, secure cookies
- **Algorithm**: HS256 (HMAC SHA-256)

### Cookie Configuration
```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

### 2FA Implementation
- **Algorithm**: TOTP (Time-based One-Time Password)
- **Library**: Speakeasy
- **Window**: 30 seconds
- **Backup Codes**: 10 single-use codes
- **QR Code**: Generated with qrcode library

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Password Reset**: 3 requests per hour
- **2FA**: 3 attempts per 5 minutes
- **Registration**: 3 accounts per IP per day

## Authentication Flow

### Registration Flow
```
1. User submits registration form
2. Validate email, password, and data
3. Check if email already exists
4. Hash password with bcrypt
5. Create user record
6. Generate email verification token
7. Send verification email
8. Return success response
```

### Login Flow
```
1. User submits email and password
2. Validate credentials format
3. Find user by email
4. Compare password hash
5. Check if account is verified
6. If 2FA enabled:
   - Return requiresTwoFactor: true
   - Wait for 2FA code
7. Generate JWT tokens
8. Set httpOnly cookies
9. Update lastLoginAt
10. Return user data
```

### 2FA Login Flow
```
1. User provides email and 2FA code
2. Retrieve temporary auth session
3. Verify TOTP code
4. Generate JWT tokens
5. Set httpOnly cookies
6. Complete login
```

### Token Refresh Flow
```
1. Client sends refresh token cookie
2. Verify refresh token signature
3. Check token expiration
4. Check if user exists
5. Generate new access token
6. Set new access token cookie
7. Return success
```

### Password Reset Flow
```
1. User requests password reset
2. Generate reset token (UUID)
3. Store token with 1-hour expiration
4. Send reset email with token link
5. User clicks link with token
6. Verify token validity
7. User submits new password
8. Hash new password
9. Update user password
10. Invalidate reset token
11. Send confirmation email
```

## Guards and Decorators

### @Public()
Mark route as public (no auth required):
```typescript
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

### @Roles()
Require specific roles:
```typescript
@Roles('ADMIN')
@Get('admin/users')
getUsers() {
  // Only accessible by ADMIN
}
```

### @CurrentUser()
Get authenticated user:
```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## Error Handling
- `401 UNAUTHORIZED` - Invalid credentials or token
- `403 FORBIDDEN` - Insufficient permissions
- `400 BAD_REQUEST` - Validation errors
- `409 CONFLICT` - Email already registered
- `429 TOO_MANY_REQUESTS` - Rate limit exceeded

## Session Management

### Active Sessions
Users can view and manage active sessions:
- View all active devices
- See last activity time
- Revoke specific sessions
- Logout from all devices

### Session Storage
Sessions stored in Redis with user ID as key:
```typescript
{
  userId: 'uuid',
  sessionId: 'session-uuid',
  deviceInfo: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1',
  lastActivity: '2025-01-15T10:30:00Z',
  expiresAt: '2025-01-22T10:30:00Z'
}
```

## OAuth Integration

### Google OAuth
1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. User authorizes application
4. Google redirects to callback URL
5. Exchange code for access token
6. Fetch user profile from Google
7. Create or find user by email
8. Generate JWT tokens
9. Redirect to dashboard

### Configuration
```typescript
{
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback',
  scope: ['email', 'profile']
}
```

## Testing
```bash
# Run auth tests
npm run test -- auth

# Test with coverage
npm run test:cov -- auth

# E2E tests
npm run test:e2e -- auth
```

## Usage Examples

### Register New User
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  })
});
```

### Login
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});
```

### Access Protected Route
```typescript
const response = await fetch('/api/auth/profile', {
  credentials: 'include' // Sends httpOnly cookies
});
```

## Best Practices
1. Always use HTTPS in production
2. Enable 2FA for sensitive accounts
3. Rotate JWT secrets regularly
4. Monitor failed login attempts
5. Implement account lockout after repeated failures
6. Use strong password requirements
7. Send security notifications for sensitive actions
8. Regularly audit active sessions
9. Implement CSRF protection
10. Keep dependencies updated

## Related Modules
- **Sessions** - Active session management
- **Admin** - User management
- **Audit** - Login/auth activity logs
- **Notifications** - Security notifications
- All modules - Authentication required

## Environment Variables
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_VERIFICATION_URL=http://localhost:3000/verify
PASSWORD_RESET_URL=http://localhost:3000/reset-password
```

## Security Checklist
- [x] Password hashing with bcrypt
- [x] JWT token authentication
- [x] HttpOnly secure cookies
- [x] CSRF protection
- [x] Rate limiting
- [x] 2FA support
- [x] Email verification
- [x] Password reset flow
- [x] OAuth integration
- [x] Session management
- [x] Role-based access control
- [x] Account lockout
- [x] Audit logging
