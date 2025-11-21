import mongoose, { Schema, models, Types } from 'mongoose';

export interface IWedding {
  _id: string;
  userId: Types.ObjectId | string;
  groomName: string;
  brideName: string;
  partner1Type?: 'groom' | 'bride';
  partner2Type?: 'groom' | 'bride';
  eventDate: Date;
  eventTime: string;
  venue: string;
  venueAddress: string;
  venueCoordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  backgroundPattern?: string;
  bitPhone?: string;
  payboxPhone?: string;
  bitQrImage?: string;
  enableBitGifts?: boolean;
  uniqueUrl: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
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
    theme: {
      primaryColor: {
        type: String,
        default: '#C4A57B', // Elegant gold
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
