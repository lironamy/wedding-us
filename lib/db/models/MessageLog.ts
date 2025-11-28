import mongoose, { Schema, models, Types } from 'mongoose';

export type MessageDeliveryStatus =
  | 'queued'     // Accepted by Twilio
  | 'pending'    // Waiting to be sent
  | 'sent'       // Sent to carrier
  | 'delivered'  // Delivered to recipient
  | 'read'       // Read by recipient (WhatsApp only)
  | 'failed'     // Failed to send
  | 'undelivered'; // Could not be delivered

export interface IMessageLog {
  _id: string;
  weddingId: Types.ObjectId | string;
  guestId: Types.ObjectId | string;
  scheduledMessageId?: Types.ObjectId | string;
  // Twilio tracking
  twilioSid: string;
  deliveryStatus: MessageDeliveryStatus;
  // Message details
  messageType: string;
  toPhone: string;
  fromPhone: string;
  // Error info
  errorCode?: string;
  errorMessage?: string;
  // Timestamps
  sentAt: Date;
  statusUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageLogSchema = new Schema<IMessageLog>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
      index: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
      index: true,
    },
    scheduledMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduledMessage',
      index: true,
    },
    twilioSid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['queued', 'pending', 'sent', 'delivered', 'read', 'failed', 'undelivered'],
      default: 'queued',
      index: true,
    },
    messageType: {
      type: String,
      required: true,
    },
    toPhone: {
      type: String,
      required: true,
    },
    fromPhone: {
      type: String,
      required: true,
    },
    errorCode: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    statusUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
MessageLogSchema.index({ weddingId: 1, deliveryStatus: 1 });
MessageLogSchema.index({ weddingId: 1, guestId: 1 });
MessageLogSchema.index({ scheduledMessageId: 1, deliveryStatus: 1 });

const MessageLog = models.MessageLog ||
  mongoose.model<IMessageLog>('MessageLog', MessageLogSchema);

export default MessageLog;
