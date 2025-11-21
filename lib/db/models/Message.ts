import mongoose, { Schema, models, Types } from 'mongoose';

export interface IMessage {
  _id: string;
  weddingId: Types.ObjectId | string;
  guestId: Types.ObjectId | string;
  messageType: 'invitation' | 'rsvp_reminder' | 'rsvp_reminder_2' | 'day_before' | 'thank_you';
  messageContent: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
  sentBy?: Types.ObjectId | string; // User who sent the message
  notes?: string;
  // Batch sending fields
  batchId?: string; // Group ID for messages sent together
  deliveryStatus?: 'pending' | 'delivered' | 'failed' | 'read'; // Detailed delivery status
  scheduledFor?: Date; // When the message is scheduled to be sent
  whatsappMessageId?: string; // WhatsApp message ID from API
  errorMessage?: string; // Error details if sending failed
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest ID is required'],
    },
    messageType: {
      type: String,
      enum: ['invitation', 'rsvp_reminder', 'rsvp_reminder_2', 'day_before', 'thank_you'],
      required: [true, 'Message type is required'],
    },
    messageContent: {
      type: String,
      required: [true, 'Message content is required'],
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
    // Batch sending fields
    batchId: {
      type: String,
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'read'],
      default: 'pending',
    },
    scheduledFor: {
      type: Date,
    },
    whatsappMessageId: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
MessageSchema.index({ weddingId: 1 });
MessageSchema.index({ guestId: 1 });
MessageSchema.index({ messageType: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ sentAt: 1 });
// batchId index is already defined in schema with `index: true`
MessageSchema.index({ deliveryStatus: 1 });
MessageSchema.index({ scheduledFor: 1 });

const Message = models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
