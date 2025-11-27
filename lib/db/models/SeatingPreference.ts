import mongoose, { Schema, models, Types } from 'mongoose';

export interface ISeatingPreference {
  _id: string;
  weddingId: Types.ObjectId | string;
  guestAId: Types.ObjectId | string;
  guestBId: Types.ObjectId | string;
  type: 'together' | 'apart';
  scope: 'sameTable' | 'adjacentTables';
  strength: 'must' | 'try';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeatingPreferenceSchema = new Schema<ISeatingPreference>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    guestAId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest A ID is required'],
    },
    guestBId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest B ID is required'],
    },
    type: {
      type: String,
      enum: ['together', 'apart'],
      required: [true, 'Preference type is required'],
    },
    scope: {
      type: String,
      enum: ['sameTable', 'adjacentTables'],
      default: 'sameTable',
    },
    strength: {
      type: String,
      enum: ['must', 'try'],
      default: 'try',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
SeatingPreferenceSchema.index({ weddingId: 1 });
SeatingPreferenceSchema.index({ weddingId: 1, guestAId: 1, guestBId: 1 });
SeatingPreferenceSchema.index({ weddingId: 1, type: 1, enabled: 1 });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.SeatingPreference) {
  delete models.SeatingPreference;
}

const SeatingPreference = models.SeatingPreference || mongoose.model<ISeatingPreference>('SeatingPreference', SeatingPreferenceSchema);

export default SeatingPreference;
