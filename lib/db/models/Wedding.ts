import mongoose, { Schema, models, Types } from 'mongoose';

export interface ISeatingSettings {
  mode: 'auto' | 'manual';
  seatsPerTable: number;
  autoRecalcPolicy: 'onRsvpChangeGroupOnly' | 'onRsvpChangeAll' | 'manualOnly';
  adjacencyPolicy: 'forbidSameTableOnly' | 'forbidSameAndAdjacent';
  simulationEnabled: boolean;
  // Children's table settings
  enableKidsTable: boolean;
  kidsTableMinAge?: number; // Minimum age for kids table (younger stay with parents)
  kidsTableMinCount?: number; // Minimum kids needed to create a kids table
  // Singles placement
  avoidSinglesAlone: boolean; // Don't place singles alone at couple-heavy tables
  // Hall zones
  enableZonePlacement: boolean; // Use hall zones for placement
}

export interface IHallElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  inSidebar: boolean;
}

export interface IWedding {
  _id: string;
  userId: Types.ObjectId | string;
  groomName: string;
  brideName: string;
  contactPhone?: string;
  partner1Type?: 'groom' | 'bride';
  partner2Type?: 'groom' | 'bride';
  eventDate: Date;
  eventTime: string;
  chuppahTime?: string;
  venue: string;
  venueAddress: string;
  venueCoordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaPosition?: {
    x: number;
    y: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  backgroundPattern?: string;
  invitationTemplate?: string;
  bitPhone?: string;
  payboxPhone?: string;
  bitQrImage?: string;
  enableBitGifts?: boolean;
  askAboutMeals?: boolean; // Whether to ask guests about meal preferences
  mealOptions?: {
    regular: boolean;
    vegetarian: boolean;
    vegan: boolean;
    kids: boolean;
    glutenFree: boolean;
    other: boolean;
  };
  customOtherMealName?: string; // Custom name for 'other' meal type
  maxGuests: number;
  uniqueUrl: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  // Seating settings
  seatingSettings?: ISeatingSettings;
  // Hall elements (dance floor, bar, stage, etc.)
  hallElements?: IHallElement[];
  // Payment fields
  paymentStatus?: 'free' | 'pending' | 'paid' | 'failed';
  paymentDetails?: {
    transactionId: string;
    amount: number;
    paidAt: Date;
    packageGuests: number;
  };
  pendingPayment?: {
    transactionId: string;
    amount: number;
    packageGuests: number;
    createdAt: Date;
  };
  // Refund tracking
  refundRequest?: {
    requestedAt: Date;
    previousPackage: number;
    newPackage: number;
    previousAmount: number;
    refundAmount: number;
    status: 'pending' | 'completed' | 'rejected';
  };
  // Store original payment details when refunded to free package
  refundedPaymentDetails?: {
    transactionId: string;
    amount: number;
    paidAt: Date;
    packageGuests: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WeddingSchema = new Schema<IWedding>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    groomName: {
      type: String,
      required: [true, 'Groom name is required'],
      trim: true,
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    brideName: {
      type: String,
      required: [true, 'Bride name is required'],
      trim: true,
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    partner1Type: {
      type: String,
      enum: ['groom', 'bride'],
      default: 'groom',
    },
    partner2Type: {
      type: String,
      enum: ['groom', 'bride'],
      default: 'bride',
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
    },
    chuppahTime: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    venueAddress: {
      type: String,
      required: [true, 'Venue address is required'],
      trim: true,
    },
    venueCoordinates: {
      lat: Number,
      lng: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
    },
    mediaPosition: {
      x: {
        type: Number,
        default: 50,
      },
      y: {
        type: Number,
        default: 50,
      },
    },
    theme: {
      primaryColor: {
        type: String,
        default: '#7950a5', // Elegant gold
      },
      secondaryColor: {
        type: String,
        default: '#2C3E50', // Dark blue-grey
      },
      fontFamily: {
        type: String,
        default: 'Assistant, sans-serif', // Hebrew-friendly font
      },
    },
    backgroundPattern: {
      type: String,
      default: '',
    },
    invitationTemplate: {
      type: String,
      default: 'classic',
    },
    bitPhone: {
      type: String,
      trim: true,
    },
    payboxPhone: {
      type: String,
      trim: true,
    },
    bitQrImage: {
      type: String,
    },
    enableBitGifts: {
      type: Boolean,
      default: false,
    },
    askAboutMeals: {
      type: Boolean,
      default: true, // Default to asking about meals
    },
    mealOptions: {
      regular: { type: Boolean, default: true },
      vegetarian: { type: Boolean, default: true },
      vegan: { type: Boolean, default: true },
      kids: { type: Boolean, default: true },
      glutenFree: { type: Boolean, default: true },
      other: { type: Boolean, default: true },
    },
    customOtherMealName: {
      type: String,
      trim: true,
      default: '',
    },
    seatingSettings: {
      mode: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'manual',
      },
      seatsPerTable: {
        type: Number,
        default: 12,
        min: 1,
        max: 20,
      },
      autoRecalcPolicy: {
        type: String,
        enum: ['onRsvpChangeGroupOnly', 'onRsvpChangeAll', 'manualOnly'],
        default: 'onRsvpChangeGroupOnly',
      },
      adjacencyPolicy: {
        type: String,
        enum: ['forbidSameTableOnly', 'forbidSameAndAdjacent'],
        default: 'forbidSameTableOnly',
      },
      simulationEnabled: {
        type: Boolean,
        default: false,
      },
      enableKidsTable: {
        type: Boolean,
        default: false,
      },
      kidsTableMinAge: {
        type: Number,
        default: 6,
        min: 0,
        max: 18,
      },
      kidsTableMinCount: {
        type: Number,
        default: 6,
        min: 2,
        max: 20,
      },
      avoidSinglesAlone: {
        type: Boolean,
        default: true,
      },
      enableZonePlacement: {
        type: Boolean,
        default: false,
      },
    },
    hallElements: {
      type: [{
        id: { type: String },
        type: { type: String },
        name: { type: String },
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number },
        color: { type: String },
        inSidebar: { type: Boolean, default: false },
      }],
      default: [],
    },
    maxGuests: {
      type: Number,
      default: 200,
      min: 200,
      max: 1000,
    },
    uniqueUrl: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'pending', 'paid', 'failed'],
      default: 'free',
    },
    paymentDetails: {
      transactionId: String,
      amount: Number,
      paidAt: Date,
      packageGuests: Number,
    },
    pendingPayment: {
      transactionId: String,
      amount: Number,
      packageGuests: Number,
      createdAt: Date,
    },
    refundRequest: {
      requestedAt: Date,
      previousPackage: Number,
      newPackage: Number,
      previousAmount: Number,
      refundAmount: Number,
      status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
      },
    },
    refundedPaymentDetails: {
      transactionId: String,
      amount: Number,
      paidAt: Date,
      packageGuests: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes (uniqueUrl already indexed via unique: true)
WeddingSchema.index({ userId: 1 });
WeddingSchema.index({ eventDate: 1 });
WeddingSchema.index({ status: 1 });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.Wedding) {
  delete models.Wedding;
}

const Wedding = models.Wedding || mongoose.model<IWedding>('Wedding', WeddingSchema);

export default Wedding;
