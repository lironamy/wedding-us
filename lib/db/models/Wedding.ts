import mongoose, { Schema, models, Types } from 'mongoose';

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
  maxGuests: number;
  uniqueUrl: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
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

const Wedding = models.Wedding || mongoose.model<IWedding>('Wedding', WeddingSchema);

export default Wedding;
