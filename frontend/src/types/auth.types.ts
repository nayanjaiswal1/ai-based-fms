/**
 * Authentication-related TypeScript interfaces
 */

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface Login2FADto {
  email: string;
  password: string;
  twoFactorCode: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    subscriptionTier: string;
    twoFactorEnabled?: boolean;
  };
}

export interface Requires2FAResponse {
  requires2FA: true;
  message: string;
}

export interface Enable2FAResponse {
  secret: string;
  qrCode: string;
  message: string;
}

export interface Verify2FAResponse {
  message: string;
  backupCodes: string[];
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Only in development
  resetUrl?: string; // Only in development
}
