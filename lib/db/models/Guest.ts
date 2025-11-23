import mongoose, { Schema, models, Types } from 'mongoose';

export interface IGuest {
  _id: string;
  guestId: string; // UUID
  weddingId: Types.ObjectId | string;
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  invitedCount?: number;
  uniqueToken: string; // UUID for RSVP link
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  adultsAttending?: number;
  childrenAttending?: number;
  // Meal counts
  regularMeals?: number;
  vegetarianMeals?: number;
  veganMeals?: number;
  otherMeals?: number;
  otherMealDescription?: string;
  // Legacy field - kept for backwards compatibility
  mealType?: 'regular' | 'vegetarian' | 'vegan' | 'other';
  specialMealRequests?: string;
  notes?: string;
  tableAssignment?: string;
  tableNumber?: number;
  giftAmount?: number;
  giftMethod?: 'bit' | 'paybox' | 'none';
  messageSent: Array<{
    type: 'invitation' | 'rsvp_reminder' | 'day_before' | 'thank_you';
    sentAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
    },
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    familyGroup: {
      type: String,
      trim: true,
    },
    invitedCount: {
      type: Number,
      min: 1,
    },
    uniqueToken: {
      type: String,
      required: true,
      unique: true,
    },
    rsvpStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending',
    },
    adultsAttending: {
      type: Number,
      min: 0,
      default: 0,
    },
    childrenAttending: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Meal counts
    regularMeals: {
      type: Number,
      min: 0,
      default: 0,
    },
    vegetarianMeals: {
      type: Number,
      min: 0,
      default: 0,
    },
    veganMeals: {
      type: Number,
      min: 0,
      default: 0,
    },
    otherMeals: {
      type: Number,
      min: 0,
      default: 0,
    },
    otherMealDescription: {
      type: String,
      trim: true,
    },
    // Legacy field
    mealType: {
      type: String,
      enum: ['regular', 'vegetarian', 'vegan', 'other'],
      default: 'regular',
    },
    specialMealRequests: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    tableAssignment: {
      type: String,
      trim: true,
    },
    tableNumber: {
      type: Number,
    },
    giftAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    giftMethod: {
      type: String,
      enum: ['bit', 'paybox', 'none'],
      default: 'none',
    },
    messageSent: [
      {
        type: {
          type: String,
          enum: ['invitation', 'rsvp_reminder', 'day_before', 'thank_you'],
          required: true,
        },
        sentAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes (uniqueToken and guestId already indexed via unique: true)
GuestSchema.index({ weddingId: 1 });
GuestSchema.index({ rsvpStatus: 1 });
GuestSchema.index({ familyGroup: 1 });
GuestSchema.index({ phone: 1 });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.Guest) {
  delete models.Guest;
}

const Guest = models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);

export default Guest;
