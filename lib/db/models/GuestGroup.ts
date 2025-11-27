import mongoose, { Schema, models, Types } from 'mongoose';

export interface IGuestGroup {
  _id: string;
  weddingId: Types.ObjectId | string;
  name: string;
  priority?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuestGroupSchema = new Schema<IGuestGroup>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
GuestGroupSchema.index({ weddingId: 1 });
GuestGroupSchema.index({ weddingId: 1, name: 1 }, { unique: true });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.GuestGroup) {
  delete models.GuestGroup;
}

const GuestGroup = models.GuestGroup || mongoose.model<IGuestGroup>('GuestGroup', GuestGroupSchema);

export default GuestGroup;
