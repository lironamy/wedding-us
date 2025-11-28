import mongoose, { Schema, models, Types } from 'mongoose';

export interface ITable {
  _id: string;
  weddingId: Types.ObjectId | string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  tableType: 'adults' | 'kids' | 'mixed';
  assignedGuests: Array<Types.ObjectId | string>;
  // Auto seating fields
  mode: 'auto' | 'manual';
  groupId?: Types.ObjectId | string;
  clusterIndex?: number;
  positionX?: number;
  positionY?: number;
  locked: boolean;
  // Hall zone placement
  zone?: 'stage' | 'dance' | 'quiet' | 'general';
  // Visual settings for hall canvas
  shape?: 'round' | 'square' | 'rectangle';
  size?: 'small' | 'medium' | 'large';
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    tableName: {
      type: String,
      required: [true, 'Table name is required'],
      trim: true,
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    tableType: {
      type: String,
      enum: ['adults', 'kids', 'mixed'],
      default: 'mixed',
    },
    assignedGuests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Guest',
      },
    ],
    mode: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'manual',
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'GuestGroup',
    },
    clusterIndex: {
      type: Number,
    },
    positionX: {
      type: Number,
    },
    positionY: {
      type: Number,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    zone: {
      type: String,
      enum: ['stage', 'dance', 'quiet', 'general'],
      default: 'general',
    },
    shape: {
      type: String,
      enum: ['round', 'square', 'rectangle'],
      default: 'round',
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
TableSchema.index({ weddingId: 1 });
TableSchema.index({ tableNumber: 1 });
TableSchema.index({ weddingId: 1, groupId: 1, mode: 1 });

// Compound index to ensure unique table numbers per wedding
TableSchema.index({ weddingId: 1, tableNumber: 1 }, { unique: true });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.Table) {
  delete models.Table;
}

const Table = models.Table || mongoose.model<ITable>('Table', TableSchema);

export default Table;
