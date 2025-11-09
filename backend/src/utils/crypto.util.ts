import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment (must be 32 characters)
const ENCRYPTION_KEY = Buffer.from(
  (process.env.ENCRYPTION_KEY || '').padEnd(KEY_LENGTH, '0').slice(0, KEY_LENGTH)
);

/**
 * Encrypt a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv + authTag + encrypted (all in hex)
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * Decrypt a string encrypted with the encrypt function
 */
export function decrypt(encryptedData: string): string {
  // Extract iv, authTag, and encrypted text
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(
    encryptedData.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2),
    'hex'
  );
  const encrypted = encryptedData.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
