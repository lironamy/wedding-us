import mongoose, { Schema, models, Types } from 'mongoose';
import { setIsraelTime } from '@/lib/utils/israelTime';

export type ScheduledMessageType =
  | 'invitation'      // 8 weeks before
  | 'rsvp_reminder'   // 3 weeks before
  | 'rsvp_reminder_2' // 7 days before
  | 'day_before'      // 1 day before
  | 'thank_you'       // 1 day after
  | 'custom';         // Manual scheduling

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
  // Custom message fields (for manual scheduling)
  customTitle?: string;
  customMessage?: string;
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
      enum: ['invitation', 'rsvp_reminder', 'rsvp_reminder_2', 'day_before', 'thank_you', 'custom'],
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
    customTitle: {
      type: String,
    },
    customMessage: {
      type: String,
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
  custom: {
    daysBeforeEvent: 0, // Not used for custom - user sets the date
    targetFilter: { rsvpStatus: 'all' },
    description: 'הודעה מותאמת אישית',
  },
};

/**
 * Calculate scheduled dates based on event date
 * Note: 'custom' type is excluded as it uses user-specified dates
 * Times are set to 9:00 AM Israel time (Asia/Jerusalem)
 */
export function calculateScheduledDates(eventDate: Date): Partial<Record<ScheduledMessageType, Date>> {
  const result: Record<string, Date> = {};

  for (const [type, config] of Object.entries(MESSAGE_SCHEDULE_CONFIG)) {
    // Skip custom type - it uses user-specified dates
    if (type === 'custom') continue;

    // Calculate the date (days before/after event)
    const scheduledDate = new Date(eventDate);
    scheduledDate.setDate(scheduledDate.getDate() - config.daysBeforeEvent);

    // Set to 9:00 AM Israel time (handles DST automatically)
    const finalDate = setIsraelTime(scheduledDate, 9, 0);
    result[type] = finalDate;
  }

  return result as Partial<Record<ScheduledMessageType, Date>>;
}
