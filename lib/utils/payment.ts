/**
 * Generate Bit payment link
 * @param phoneNumber - Israeli phone number (e.g., "0501234567")
 * @returns Bit payment URL
 */
export function generateBitLink(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Bit app link format
  return `https://bit.app/${cleanNumber}`;
}

/**
 * Generate Paybox payment link
 * @param phoneNumber - Israeli phone number (e.g., "0501234567")
 * @returns Paybox payment URL
 */
export function generatePayboxLink(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Paybox link format
  return `https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=${cleanNumber}`;
}

/**
 * Format currency in Israeli Shekels
 * @param amount - Amount in NIS
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate Israeli phone number
 * @param phoneNumber - Phone number to validate
 * @returns true if valid Israeli phone number
 */
export function isValidIsraeliPhone(phoneNumber: string): boolean {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Israeli phone numbers are 10 digits starting with 0
  // Mobile: 05X-XXX-XXXX
  // Landline: 0X-XXX-XXXX
  return /^0[2-9]\d{7,8}$/.test(cleanNumber);
}

/**
 * Format Israeli phone number for display
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number (e.g., "050-123-4567")
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  if (cleanNumber.length === 10) {
    // Mobile format: 050-123-4567
    return `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
  }

  return phoneNumber; // Return as-is if not standard format
}
