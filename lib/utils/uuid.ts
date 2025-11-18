import { randomBytes } from 'crypto';

/**
 * Generate a unique UUID for wedding URLs and guest tokens
 */
export function generateUUID(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generate a shorter, URL-friendly unique ID
 */
export function generateShortId(length: number = 8): string {
  return randomBytes(length)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .substring(0, length);
}
