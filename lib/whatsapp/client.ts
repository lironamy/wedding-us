import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { MongoAuth } from './MongoAuth';

type ClientStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_ready'
  | 'authenticated'
  | 'ready'
  | 'error';

interface WhatsAppState {
  status: ClientStatus;
  qrCode?: string;
  error?: string;
  sessionInfo?: {
    pushname?: string;
    wid?: string;
  };
}

class WhatsAppService {
  private client: Client | null = null;
  private state: WhatsAppState = { status: 'disconnected' };
  private qrCodeData: string | null = null;
  private mongoAuth: MongoAuth;

  constructor() {
    this.mongoAuth = new MongoAuth('wedding-platform');
  }

  getState(): WhatsAppState {
    return { ...this.state };
  }

  async initialize(): Promise<WhatsAppState> {
    if (this.client && this.state.status === 'ready') {
      return this.state;
    }

    // Destroy existing client if any
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
    }

    this.state = { status: 'connecting' };
    this.qrCodeData = null;

    try {
      // Load existing session from MongoDB
      const existingSession = await this.mongoAuth.getSession();

      this.client = new Client({
        session: existingSession || undefined,
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
      });

      // QR Code event
      this.client.on('qr', async (qr) => {
        console.log('QR Code received');
        try {
          this.qrCodeData = await qrcode.toDataURL(qr);
          this.state = {
            status: 'qr_ready',
            qrCode: this.qrCodeData,
          };
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      });

      // Authenticated event - save session to MongoDB
      this.client.on('authenticated', async (session) => {
        console.log('WhatsApp authenticated');
        this.state = { status: 'authenticated' };

        // Save session to MongoDB
        if (session) {
          try {
            await this.mongoAuth.saveSession(session);
          } catch (err) {
            console.error('Error saving session to MongoDB:', err);
          }
        }
      });

      // Ready event
      this.client.on('ready', async () => {
        console.log('WhatsApp client is ready');
        const info = this.client?.info;
        this.state = {
          status: 'ready',
          sessionInfo: {
            pushname: info?.pushname,
            wid: info?.wid?.user,
          },
        };
      });

      // Auth failure event
      this.client.on('auth_failure', (msg) => {
        console.error('WhatsApp auth failure:', msg);
        this.state = {
          status: 'error',
          error: 'Authentication failed: ' + msg,
        };
      });

      // Disconnected event
      this.client.on('disconnected', (reason) => {
        console.log('WhatsApp disconnected:', reason);
        this.state = { status: 'disconnected' };
        this.client = null;
      });

      // Initialize client
      await this.client.initialize();

      return this.state;
    } catch (error: any) {
      console.error('Error initializing WhatsApp:', error);
      this.state = {
        status: 'error',
        error: error.message || 'Failed to initialize WhatsApp',
      };
      return this.state;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.logout();
        await this.client.destroy();
      } catch (e) {
        // Ignore errors
      }
      this.client = null;
    }

    // Delete session from MongoDB
    try {
      await this.mongoAuth.deleteSession();
    } catch (e) {
      console.error('Error deleting session from MongoDB:', e);
    }

    this.state = { status: 'disconnected' };
    this.qrCodeData = null;
  }

  async sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.client || this.state.status !== 'ready') {
      return {
        success: false,
        error: 'WhatsApp is not connected',
      };
    }

    try {
      // Format phone number for WhatsApp
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      // Check if number is registered on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        return {
          success: false,
          error: `Number ${phoneNumber} is not registered on WhatsApp`,
        };
      }

      // Send message
      const result = await this.client.sendMessage(chatId, message);

      return {
        success: true,
        messageId: result.id.id,
      };
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  }

  async sendBulkMessages(
    messages: Array<{ phone: string; message: string; guestId: string; guestName: string }>,
    delayMs: number = 3000,
    onProgress?: (sent: number, failed: number, total: number, current: string) => void
  ): Promise<{
    results: Array<{ guestId: string; guestName: string; success: boolean; error?: string; messageId?: string }>;
    summary: { total: number; successful: number; failed: number };
  }> {
    const results: Array<{ guestId: string; guestName: string; success: boolean; error?: string; messageId?: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i++) {
      const { phone, message, guestId, guestName } = messages[i];

      // Send progress update
      if (onProgress) {
        onProgress(successful, failed, messages.length, guestName);
      }

      const result = await this.sendMessage(phone, message);

      if (result.success) {
        successful++;
        results.push({
          guestId,
          guestName,
          success: true,
          messageId: result.messageId,
        });
      } else {
        failed++;
        results.push({
          guestId,
          guestName,
          success: false,
          error: result.error,
        });
      }

      // Delay between messages (except for the last one)
      if (i < messages.length - 1) {
        await this.delay(delayMs);
      }
    }

    return {
      results,
      summary: {
        total: messages.length,
        successful,
        failed,
      },
    };
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle Israeli numbers
    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.substring(1);
    } else if (!cleaned.startsWith('972')) {
      cleaned = '972' + cleaned;
    }

    return cleaned;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isReady(): boolean {
    return this.state.status === 'ready';
  }
}

// Singleton instance
const whatsappService = new WhatsAppService();

export default whatsappService;
export { WhatsAppService, type WhatsAppState, type ClientStatus };
