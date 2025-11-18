import mongoose, { Schema, models, Types } from 'mongoose';

export interface IMessage {
  _id: string;
  weddingId: Types.ObjectId | string;
  guestId: Types.ObjectId | string;
  messageType: 'invitation' | 'rsvp_reminder' | 'day_before' | 'thank_you';
  messageContent: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
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
      enum: ['invitation', 'rsvp_reminder', 'day_before', 'thank_you'],
      required: [true, 'Message type is required'],
    },
    messageContent: {
      type: String,
      required: [true, 'Message content is required'],
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

const Message = models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
