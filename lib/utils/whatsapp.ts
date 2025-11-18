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
export function generateWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// Also export with uppercase URL for compatibility
export const generateWhatsAppURL = generateWhatsAppUrl;
