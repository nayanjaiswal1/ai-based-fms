import * as crypto from 'crypto';

/**
 * Simple encryption utility for storing sensitive data like statement passwords
 * Uses AES-256-GCM for encryption
 */

// Get encryption key from environment or generate a default (in production, MUST be in env)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes for AES-256

if (!process.env.ENCRYPTION_KEY) {
  console.warn(
    'WARNING: Using default ENCRYPTION_KEY. Set ENCRYPTION_KEY in environment variables for production!',
  );
}

/**
 * Encrypt a string value
 * @param text The text to encrypt
 * @returns Encrypted text in format: iv:authTag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) return null;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return in format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * @param encryptedText The encrypted text in format: iv:authTag:encrypted
 * @returns Decrypted text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return null;

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}
