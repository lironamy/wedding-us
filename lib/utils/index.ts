/**
 * Generate a unique UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Format a date to Hebrew locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a phone number for WhatsApp (remove spaces, dashes, etc.)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with 972
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.slice(1);
  }

  // If doesn't start with country code, add 972
  if (!cleaned.startsWith('972')) {
    cleaned = '972' + cleaned;
  }

  return cleaned;
}

/**
 * Generate WhatsApp message URL
 */
export function generateWhatsAppURL(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Generate Bit payment URL
 */
export function generateBitURL(phone: string): string {
  return `https://bit.app/${formatPhoneForWhatsApp(phone)}`;
}

/**
 * Generate Paybox payment URL
 */
export function generatePayboxURL(phone: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  return `https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=${formattedPhone}`;
}

/**
 * Calculate response rate percentage
 */
export function calculateResponseRate(responded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((responded / total) * 100);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Format currency (ILS)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
  }).format(amount);
}

/**
 * Validate Israeli phone number
 */
export function validateIsraeliPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Israeli phone numbers are 9-10 digits (with or without country code)
  return /^(972|0)?[1-9]\d{7,8}$/.test(cleaned);
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random color (for avatars, etc.)
 */
export function generateRandomColor(): string {
  const colors = [
    '#7950a5', '#A88B63', '#8B7355', '#6B5B4D',
    '#2C3E50', '#34495E', '#5D6D7E', '#85929E',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
