/**
 * Twilio WhatsApp Service
 * Handles WhatsApp message sending via Twilio Business API with Content Templates
 */

import twilio from 'twilio';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string; // Your Twilio WhatsApp number (format: whatsapp:+14155238886)
  statusCallbackUrl?: string; // URL for Twilio to send delivery status updates
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

export interface BulkSendResult {
  successful: number;
  failed: number;
  results: Array<{
    guestId: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export interface TemplateVariables {
  [key: string]: string;
}

/**
 * Twilio WhatsApp Service Class
 */
export class TwilioWhatsAppService {
  private client: ReturnType<typeof twilio>;
  private fromNumber: string;
  private statusCallbackUrl?: string;

  constructor(config: TwilioConfig) {
    this.client = twilio(config.accountSid, config.authToken);
    this.fromNumber = config.whatsappNumber;
    this.statusCallbackUrl = config.statusCallbackUrl;
  }

  /**
   * Format phone number for WhatsApp (remove spaces, dashes, add country code)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 972 (Israel)
    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.slice(1);
    }

    // If doesn't start with country code, add 972
    if (!cleaned.startsWith('972')) {
      cleaned = '972' + cleaned;
    }

    // Add whatsapp: prefix and + for international format
    return `whatsapp:+${cleaned}`;
  }

  /**
   * Send a single WhatsApp message using Content Template
   * Templates must be pre-approved by WhatsApp via Twilio Console
   */
  async sendMessageWithTemplate(
    to: string,
    contentSid: string,
    variables: TemplateVariables
  ): Promise<SendMessageResult> {
    try {
      const formattedTo = this.formatPhoneNumber(to);

      console.log('📱 [Twilio] Sending WhatsApp template message to:', formattedTo);
      console.log('📝 [Twilio] Content SID:', contentSid);
      console.log('📝 [Twilio] Variables:', JSON.stringify(variables, null, 2));
      console.log('📞 [Twilio] Status Callback URL:', this.statusCallbackUrl || 'NOT SET');

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: formattedTo,
        contentSid: contentSid,
        contentVariables: JSON.stringify(variables),
        ...(this.statusCallbackUrl && { statusCallback: this.statusCallbackUrl }),
      });

      console.log('✅ [Twilio] Template message sent successfully:', result.sid);

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error: any) {
      console.error('❌ [Twilio] Error sending template message:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Send a single WhatsApp freeform message (only works within 24-hour window)
   */
  async sendMessage(
    to: string,
    message: string
  ): Promise<SendMessageResult> {
    try {
      const formattedTo = this.formatPhoneNumber(to);

      console.log('📱 [Twilio] Sending WhatsApp message to:', formattedTo);

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: formattedTo,
        body: message,
        ...(this.statusCallbackUrl && { statusCallback: this.statusCallbackUrl }),
      });

      console.log('✅ [Twilio] Message sent successfully:', result.sid);

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error: any) {
      console.error('❌ [Twilio] Error sending message:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Send messages in bulk using Content Templates
   */
  async sendBulkMessagesWithTemplate(
    messages: Array<{ phone: string; variables: TemplateVariables; guestId: string }>,
    contentSid: string,
    options: {
      delayBetweenMessages?: number;
      onProgress?: (sent: number, total: number, guestId: string) => void;
      onError?: (error: string, guestId: string) => void;
    } = {}
  ): Promise<BulkSendResult> {
    const {
      delayBetweenMessages = 1000,
      onProgress,
      onError,
    } = options;

    const results: Array<{
      guestId: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];
    let successful = 0;
    let failed = 0;

    console.log(`📱 [Twilio] Starting bulk template send: ${messages.length} messages`);
    console.log(`📝 [Twilio] Using Content SID: ${contentSid}`);

    for (let i = 0; i < messages.length; i++) {
      const { phone, variables, guestId } = messages[i];

      try {
        const result = await this.sendMessageWithTemplate(phone, contentSid, variables);

        results.push({
          guestId,
          ...result,
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
          if (onError) {
            onError(result.error || 'Unknown error', guestId);
          }
        }

        if (onProgress) {
          onProgress(i + 1, messages.length, guestId);
        }

        if (i < messages.length - 1) {
          await this.delay(delayBetweenMessages);
        }
      } catch (error: any) {
        console.error('❌ [Twilio] Error sending to', phone, ':', error);
        failed++;
        results.push({
          guestId,
          success: false,
          error: error.message || 'Unknown error',
        });

        if (onError) {
          onError(error.message || 'Unknown error', guestId);
        }
      }
    }

    console.log(
      `📱 [Twilio] Bulk template send complete: ${successful} successful, ${failed} failed`
    );

    return { successful, failed, results };
  }

  /**
   * Send freeform messages in bulk (only works within 24-hour window)
   */
  async sendBulkMessages(
    messages: Array<{ phone: string; message: string; guestId: string }>,
    options: {
      delayBetweenMessages?: number; // milliseconds
      onProgress?: (sent: number, total: number, guestId: string) => void;
      onError?: (error: string, guestId: string) => void;
    } = {}
  ): Promise<BulkSendResult> {
    const {
      delayBetweenMessages = 1000, // Default 1 second (Twilio can handle faster than whatsapp-web)
      onProgress,
      onError,
    } = options;

    const results: Array<{
      guestId: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];
    let successful = 0;
    let failed = 0;

    console.log(`📱 [Twilio] Starting bulk send: ${messages.length} messages`);

    for (let i = 0; i < messages.length; i++) {
      const { phone, message, guestId } = messages[i];

      try {
        const result = await this.sendMessage(phone, message);

        results.push({
          guestId,
          ...result,
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
          if (onError) {
            onError(result.error || 'Unknown error', guestId);
          }
        }

        if (onProgress) {
          onProgress(i + 1, messages.length, guestId);
        }

        // Delay before next message (except for the last one)
        if (i < messages.length - 1) {
          await this.delay(delayBetweenMessages);
        }
      } catch (error: any) {
        console.error('❌ [Twilio] Error sending to', phone, ':', error);
        failed++;
        results.push({
          guestId,
          success: false,
          error: error.message || 'Unknown error',
        });

        if (onError) {
          onError(error.message || 'Unknown error', guestId);
        }
      }
    }

    console.log(
      `📱 [Twilio] Bulk send complete: ${successful} successful, ${failed} failed`
    );

    return { successful, failed, results };
  }

  /**
   * Get message status by message ID
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: message.status,
      };
    } catch (error: any) {
      console.error('❌ [Twilio] Error fetching message status:', error);
      return {
        status: 'unknown',
        error: error.message,
      };
    }
  }

  /**
   * Helper: delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate Twilio credentials
   */
  static async validateCredentials(
    accountSid: string,
    authToken: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const client = twilio(accountSid, authToken);
      await client.api.accounts(accountSid).fetch();
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid credentials',
      };
    }
  }
}

/**
 * Create Twilio WhatsApp service instance from environment variables
 */
export function createTwilioService(): TwilioWhatsAppService | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;

  if (!accountSid || !authToken || !whatsappNumber) {
    console.warn(
      '⚠️ [Twilio] Missing environment variables. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER'
    );
    return null;
  }

  // Build status callback URL
  let statusCallbackUrl: string | undefined;
  if (baseUrl) {
    const cleanBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    statusCallbackUrl = `${cleanBaseUrl}/api/twilio-status`;
    console.log('📞 [Twilio] Status callback URL:', statusCallbackUrl);
  }

  return new TwilioWhatsAppService({
    accountSid,
    authToken,
    whatsappNumber,
    statusCallbackUrl,
  });
}

/**
 * Singleton instance (created lazily)
 */
let twilioServiceInstance: TwilioWhatsAppService | null = null;

export function getTwilioService(): TwilioWhatsAppService {
  if (!twilioServiceInstance) {
    const service = createTwilioService();
    if (!service) {
      throw new Error(
        'Twilio service not configured. Please set environment variables.'
      );
    }
    twilioServiceInstance = service;
  }
  return twilioServiceInstance;
}
