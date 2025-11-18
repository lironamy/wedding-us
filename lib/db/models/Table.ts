import mongoose, { Schema, models, Types } from 'mongoose';

export interface ITable {
  _id: string;
  weddingId: Types.ObjectId | string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  tableType: 'adults' | 'kids' | 'mixed';
  assignedGuests: Array<Types.ObjectId | string>;
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
  },
  {
    timestamps: true,
  }
);

// Create indexes
TableSchema.index({ weddingId: 1 });
TableSchema.index({ tableNumber: 1 });

// Compound index to ensure unique table numbers per wedding
TableSchema.index({ weddingId: 1, tableNumber: 1 }, { unique: true });

const Table = models.Table || mongoose.model<ITable>('Table', TableSchema);

export default Table;
