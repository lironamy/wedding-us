import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Schema for storing WhatsApp session
const WhatsAppSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  session: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Get or create the model
const WhatsAppSession = mongoose.models.WhatsAppSession ||
  mongoose.model('WhatsAppSession', WhatsAppSessionSchema);

interface SessionData {
  WABrowserId?: string;
  WASecretBundle?: string;
  WAToken1?: string;
  WAToken2?: string;
  [key: string]: any;
}

export class MongoAuth {
  private sessionId: string;

  constructor(sessionId: string = 'default') {
    this.sessionId = sessionId;
  }

  async getSession(): Promise<SessionData | null> {
    try {
      await dbConnect();

      const sessionDoc = await WhatsAppSession.findOne({
        sessionId: this.sessionId
      });

      if (sessionDoc && sessionDoc.session) {
        return JSON.parse(sessionDoc.session);
      }

      return null;
    } catch (error) {
      console.error('Error getting WhatsApp session from MongoDB:', error);
      return null;
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    try {
      await dbConnect();

      await WhatsAppSession.findOneAndUpdate(
        { sessionId: this.sessionId },
        {
          session: JSON.stringify(session),
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log('WhatsApp session saved to MongoDB');
    } catch (error) {
      console.error('Error saving WhatsApp session to MongoDB:', error);
      throw error;
    }
  }

  async deleteSession(): Promise<void> {
    try {
      await dbConnect();

      await WhatsAppSession.deleteOne({ sessionId: this.sessionId });
      console.log('WhatsApp session deleted from MongoDB');
    } catch (error) {
      console.error('Error deleting WhatsApp session from MongoDB:', error);
    }
  }

  async sessionExists(): Promise<boolean> {
    try {
      await dbConnect();

      const sessionDoc = await WhatsAppSession.findOne({
        sessionId: this.sessionId
      });

      return !!sessionDoc;
    } catch (error) {
      console.error('Error checking WhatsApp session:', error);
      return false;
    }
  }
}

export default MongoAuth;
