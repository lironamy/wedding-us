import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  proto,
} from '@whiskeysockets/baileys';
import { BufferJSON } from '@whiskeysockets/baileys/lib/Utils';

// Schema for storing WhatsApp session
const WhatsAppSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  data: { type: Object, required: true },
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a compound unique index for efficient queries (allows multiple keys per sessionId)
WhatsAppSessionSchema.index({ sessionId: 1, key: 1 }, { unique: true });

// Get or create the model
const WhatsAppSession =
  mongoose.models.WhatsAppSession ||
  mongoose.model('WhatsAppSession', WhatsAppSessionSchema);

export class MongoAuth {
  private sessionId: string;

  constructor(sessionId: string = 'default') {
    this.sessionId = sessionId;
  }

  async useMongoAuthState(): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  }> {
    await dbConnect();

    // Read data from MongoDB
    const readData = async (key: string): Promise<any> => {
      try {
        const data = await WhatsAppSession.findOne({
          sessionId: this.sessionId,
          key,
        });

        if (data && data.data) {
          // Parse the data using BufferJSON to handle Buffer objects
          return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
        }

        return null;
      } catch (error) {
        console.error(`Error reading key "${key}" from MongoDB:`, error);
        return null;
      }
    };

    // Write data to MongoDB
    const writeData = async (key: string, data: any): Promise<void> => {
      try {
        await WhatsAppSession.findOneAndUpdate(
          { sessionId: this.sessionId, key },
          {
            data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)),
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error writing key "${key}" to MongoDB:`, error);
      }
    };

    // Remove data from MongoDB
    const removeData = async (key: string): Promise<void> => {
      try {
        await WhatsAppSession.deleteOne({
          sessionId: this.sessionId,
          key,
        });
      } catch (error) {
        console.error(`Error removing key "${key}" from MongoDB:`, error);
      }
    };

    // Read credentials
    let creds: AuthenticationCreds = (await readData('creds')) || initAuthCreds();

    return {
      state: {
        creds,
        keys: {
          get: async (type: keyof SignalDataTypeMap, ids: string[]) => {
            const data: { [id: string]: any } = {};
            await Promise.all(
              ids.map(async (id) => {
                let value = await readData(`${type}-${id}`);
                if (type === 'app-state-sync-key' && value) {
                  // Use .create() instead of .fromObject() for Baileys v7
                  value = proto.Message.AppStateSyncKeyData.create(value);
                }
                data[id] = value;
              })
            );
            return data;
          },
          set: async (data: any) => {
            const tasks: Promise<void>[] = [];
            for (const category in data) {
              for (const id in data[category]) {
                const value = data[category][id];
                const key = `${category}-${id}`;
                tasks.push(value ? writeData(key, value) : removeData(key));
              }
            }
            await Promise.all(tasks);
          },
        },
      },
      saveCreds: async () => {
        await writeData('creds', creds);
      },
    };
  }

  async deleteSession(): Promise<void> {
    try {
      await dbConnect();
      await WhatsAppSession.deleteMany({ sessionId: this.sessionId });
      console.log('WhatsApp session deleted from MongoDB');
    } catch (error) {
      console.error('Error deleting WhatsApp session from MongoDB:', error);
    }
  }

  async sessionExists(): Promise<boolean> {
    try {
      await dbConnect();
      const count = await WhatsAppSession.countDocuments({
        sessionId: this.sessionId,
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking WhatsApp session:', error);
      return false;
    }
  }

  // Legacy methods for backward compatibility (no longer used with Baileys)
  async getSession(): Promise<any | null> {
    try {
      await dbConnect();
      const sessionDoc = await WhatsAppSession.findOne({
        sessionId: this.sessionId,
        key: 'creds',
      });

      if (sessionDoc && sessionDoc.data) {
        return sessionDoc.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting WhatsApp session from MongoDB:', error);
      return null;
    }
  }

  async saveSession(session: any): Promise<void> {
    try {
      await dbConnect();

      await WhatsAppSession.findOneAndUpdate(
        { sessionId: this.sessionId, key: 'creds' },
        {
          data: session,
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
}

export default MongoAuth;
