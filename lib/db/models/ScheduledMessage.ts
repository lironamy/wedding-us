import mongoose, { Schema, models, Types } from 'mongoose';

export type ScheduledMessageType =
  | 'invitation'      // 8 weeks before
  | 'rsvp_reminder'   // 3 weeks before
  | 'rsvp_reminder_2' // 7 days before
  | 'day_before'      // 1 day before
  | 'thank_you';      // 1 day after

export type ScheduledMessageStatus =
  | 'pending'    // Waiting to be sent
  | 'sending'    // Currently being sent
  | 'completed'  // Successfully sent
  | 'failed'     // Failed to send
  | 'cancelled'; // Cancelled by user

export interface IScheduledMessage {
  _id: string;
  weddingId: Types.ObjectId | string;
  messageType: ScheduledMessageType;
  scheduledFor: Date;
  status: ScheduledMessageStatus;
  // Stats
  totalGuests: number;
  sentCount: number;
  failedCount: number;
  // Execution details
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  // Settings
  targetFilter?: {
    rsvpStatus?: 'pending' | 'confirmed' | 'declined' | 'all';
  };
  // Notification sent to couple
  coupleNotified: boolean;
  coupleNotifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledMessageSchema = new Schema<IScheduledMessage>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ['invitation', 'rsvp_reminder', 'rsvp_reminder_2', 'day_before', 'thank_you'],
      required: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    totalGuests: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    targetFilter: {
      rsvpStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'declined', 'all'],
      },
    },
    coupleNotified: {
      type: Boolean,
      default: false,
    },
    coupleNotifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ScheduledMessageSchema.index({ status: 1, scheduledFor: 1 });
ScheduledMessageSchema.index({ weddingId: 1, messageType: 1 });

const ScheduledMessage = models.ScheduledMessage ||
  mongoose.model<IScheduledMessage>('ScheduledMessage', ScheduledMessageSchema);

export default ScheduledMessage;

/**
 * Schedule configuration - when to send each message type
 */
export const MESSAGE_SCHEDULE_CONFIG: Record<ScheduledMessageType, {
  daysBeforeEvent: number;
  targetFilter: { rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'all' };
  description: string;
}> = {
  invitation: {
    daysBeforeEvent: 28, // 4 weeks
    targetFilter: { rsvpStatus: 'all' },
    description: 'הזמנה ראשונית',
  },
  rsvp_reminder: {
    daysBeforeEvent: 21, // 3 weeks
    targetFilter: { rsvpStatus: 'pending' },
    description: 'תזכורת ראשונה - אישור הגעה',
  },
  rsvp_reminder_2: {
    daysBeforeEvent: 7, // 1 week
    targetFilter: { rsvpStatus: 'pending' },
    description: 'תזכורת שנייה - אישור הגעה',
  },
  day_before: {
    daysBeforeEvent: 1, // 1 day before
    targetFilter: { rsvpStatus: 'confirmed' },
    description: 'תזכורת יום לפני',
  },
  thank_you: {
    daysBeforeEvent: -1, // 1 day after (negative = after event)
    targetFilter: { rsvpStatus: 'confirmed' },
    description: 'הודעת תודה',
  },
};

/**
 * Calculate scheduled dates based on event date
 */
export function calculateScheduledDates(eventDate: Date): Record<ScheduledMessageType, Date> {
  const event = new Date(eventDate);
  event.setHours(9, 0, 0, 0); // Set to 9 AM

  const result: Record<string, Date> = {};

  for (const [type, config] of Object.entries(MESSAGE_SCHEDULE_CONFIG)) {
    const scheduledDate = new Date(event);
    scheduledDate.setDate(scheduledDate.getDate() - config.daysBeforeEvent);
    result[type] = scheduledDate;
  }

  return result as Record<ScheduledMessageType, Date>;
}
