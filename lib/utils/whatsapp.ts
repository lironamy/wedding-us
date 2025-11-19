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

  console.log('🔍 [WHATSAPP] Original message:', message.substring(0, 100));
  console.log('🔍 [WHATSAPP] Message char codes:', [...message.substring(0, 20)].map(c => c.charCodeAt(0)));

  // Direct URL encoding without Buffer conversion (which can corrupt emojis)
  const encodedMessage = encodeURIComponent(message);

  console.log('🔍 [WHATSAPP] Encoded message:', encodedMessage.substring(0, 150));
  console.log('🔍 [WHATSAPP] Encoded message bytes for first emoji:', encodedMessage.match(/%[0-9A-F]{2}/g)?.slice(0, 10));

  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// Also export with uppercase URL for compatibility
export const generateWhatsAppURL = generateWhatsAppUrl;
