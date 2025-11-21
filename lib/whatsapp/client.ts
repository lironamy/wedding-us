import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  WASocket,
  AuthenticationCreds,
  SignalDataTypeMap,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
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
  private sock: WASocket | null = null;
  private state: WhatsAppState = { status: 'disconnected' };
  private qrCodeData: string | null = null;
  private mongoAuth: MongoAuth;
  private shouldReconnect: boolean = true;
  private autoReconnectAttempted: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private isConnecting: boolean = false;

  constructor() {
    this.mongoAuth = new MongoAuth('wedding-platform');
    // Don't auto-reconnect during Next.js build phase
    // NEXT_PHASE is set during build/export phases
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
                         process.env.NEXT_PHASE === 'phase-export';
    if (!isBuildPhase) {
      // Auto-reconnect if session exists (only during runtime)
      this.initializationPromise = this.attemptAutoReconnect();
    }
  }

  private async attemptAutoReconnect() {
    // Don't attempt if already connected, connecting, or already attempted
    if (this.autoReconnectAttempted || this.isConnecting || this.state.status === 'ready') {
      return;
    }
    this.autoReconnectAttempted = true;

    try {
      const hasSession = await this.mongoAuth.sessionExists();
      if (hasSession && !this.isReady() && !this.isConnecting) {
        console.log('Found existing WhatsApp session, attempting to reconnect...');
        await this.initialize();
      }
    } catch (error) {
      console.error('Error checking for existing session:', error);
    } finally {
      this.initializationPromise = null;
    }
  }

  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  getState(): WhatsAppState {
    return { ...this.state };
  }

  async initialize(): Promise<WhatsAppState> {
    // Already connected - return current state
    if (this.sock && this.state.status === 'ready') {
      return this.state;
    }

    // Already connecting - wait and return state
    if (this.isConnecting) {
      console.log('Already connecting, waiting...');
      // Wait a bit for the existing connection attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.state;
    }

    this.isConnecting = true;

    // Close existing connection if any
    if (this.sock) {
      try {
        this.sock.end(undefined);
      } catch (e) {
        // Ignore
      }
      this.sock = null;
    }

    this.state = { status: 'connecting' };
    this.qrCodeData = null;
    this.shouldReconnect = true;

    try {
      await this.connectToWhatsApp();
      return this.state;
    } catch (error: any) {
      console.error('Error initializing WhatsApp:', error);
      this.state = {
        status: 'error',
        error: error.message || 'Failed to initialize WhatsApp',
      };
      return this.state;
    } finally {
      this.isConnecting = false;
    }
  }

  private async connectToWhatsApp() {
    try {
      // Load auth state from MongoDB
      const { state: authState, saveCreds } = await this.mongoAuth.useMongoAuthState();

      // Fetch latest Baileys version
      const { version } = await fetchLatestBaileysVersion();

      // Create socket connection
      this.sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: {
          creds: authState.creds,
          keys: makeCacheableSignalKeyStore(authState.keys, undefined as any),
        },
        browser: ['Wedding Platform', 'Chrome', '120.0.0'],
        markOnlineOnConnect: true,
      });

      // Connection update handler
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Handle QR code
        if (qr) {
          try {
            this.qrCodeData = await QRCode.toDataURL(qr);
            this.state = {
              status: 'qr_ready',
              qrCode: this.qrCodeData,
            };
            console.log('QR Code generated');
          } catch (err) {
            console.error('Error generating QR code:', err);
          }
        }

        // Handle connection status
        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          // Don't reconnect on conflict errors (multiple connections)
          const isConflict = statusCode === 409 ||
            (lastDisconnect?.error as any)?.message?.includes('conflict');

          console.log(
            'Connection closed due to',
            lastDisconnect?.error,
            ', reconnecting:',
            shouldReconnect && !isConflict
          );

          if (shouldReconnect && this.shouldReconnect && !isConflict && !this.isConnecting) {
            // Auto-reconnect with longer delay
            setTimeout(() => {
              if (!this.isConnecting && !this.isReady()) {
                this.connectToWhatsApp();
              }
            }, 5000);
          } else {
            this.state = { status: 'disconnected' };
            this.sock = null;
          }
        } else if (connection === 'open') {
          console.log('WhatsApp connection opened');
          this.state = {
            status: 'ready',
            sessionInfo: {
              pushname: this.sock?.user?.name,
              wid: this.sock?.user?.id?.split(':')[0],
            },
          };
        } else if (connection === 'connecting') {
          this.state = { status: 'connecting' };
        }
      });

      // Credentials update handler - save to MongoDB
      this.sock.ev.on('creds.update', saveCreds);

      // Messages upsert handler (optional - for receiving messages)
      this.sock.ev.on('messages.upsert', async (m) => {
        // You can handle incoming messages here if needed
        // console.log('Received messages:', JSON.stringify(m, undefined, 2));
      });

    } catch (error) {
      console.error('Error in connectToWhatsApp:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.shouldReconnect = false;

    if (this.sock) {
      try {
        await this.sock.logout();
        this.sock.end(undefined);
      } catch (e) {
        console.error('Error during disconnect:', e);
      }
      this.sock = null;
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

  async sendMessage(
    phoneNumber: string,
    message: string,
    imageUrl?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.sock || this.state.status !== 'ready') {
      return {
        success: false,
        error: 'WhatsApp is not connected',
      };
    }

    try {
      // Format phone number for WhatsApp
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const jid = `${formattedNumber}@s.whatsapp.net`;

      // Check if number exists on WhatsApp
      const checkResult = await this.sock.onWhatsApp(jid);
      if (!checkResult || checkResult.length === 0 || !checkResult[0]?.exists) {
        return {
          success: false,
          error: `Number ${phoneNumber} is not registered on WhatsApp`,
        };
      }

      // Send message - with image if provided
      let result;
      if (imageUrl) {
        // Send image with caption
        result = await this.sock.sendMessage(jid, {
          image: { url: imageUrl },
          caption: message,
        });
      } else {
        // Send text only
        result = await this.sock.sendMessage(jid, { text: message });
      }

      return {
        success: true,
        messageId: result?.key?.id || undefined,
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
    onProgress?: (sent: number, failed: number, total: number, current: string) => void,
    imageUrl?: string
  ): Promise<{
    results: Array<{
      guestId: string;
      guestName: string;
      success: boolean;
      error?: string;
      messageId?: string;
    }>;
    summary: { total: number; successful: number; failed: number };
  }> {
    const results: Array<{
      guestId: string;
      guestName: string;
      success: boolean;
      error?: string;
      messageId?: string;
    }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i++) {
      const { phone, message, guestId, guestName } = messages[i];

      // Send progress update
      if (onProgress) {
        onProgress(successful, failed, messages.length, guestName);
      }

      const result = await this.sendMessage(phone, message, imageUrl);

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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isReady(): boolean {
    return this.state.status === 'ready';
  }
}

// Global singleton instance - persists across module reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var whatsappServiceInstance: WhatsAppService | undefined;
}

// Use globalThis to maintain singleton across HMR and multiple API calls
const whatsappService = globalThis.whatsappServiceInstance ?? new WhatsAppService();

// In development, store in globalThis to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.whatsappServiceInstance = whatsappService;
}

export default whatsappService;
export { WhatsAppService, type WhatsAppState, type ClientStatus };
