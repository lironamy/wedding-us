import mongoose, { Schema, models, Types } from 'mongoose';

export interface ISeatAssignment {
  _id: string;
  weddingId: Types.ObjectId | string;
  tableId: Types.ObjectId | string;
  guestId: Types.ObjectId | string;
  seatsCount: number;
  assignmentType: 'real' | 'simulation';
  createdAt: Date;
  updatedAt: Date;
}

const SeatAssignmentSchema = new Schema<ISeatAssignment>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table ID is required'],
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest ID is required'],
    },
    seatsCount: {
      type: Number,
      required: [true, 'Seats count is required'],
      min: 1,
    },
    assignmentType: {
      type: String,
      enum: ['real', 'simulation'],
      required: [true, 'Assignment type is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
SeatAssignmentSchema.index({ weddingId: 1 });
SeatAssignmentSchema.index({ weddingId: 1, tableId: 1, assignmentType: 1 });
SeatAssignmentSchema.index({ weddingId: 1, guestId: 1, assignmentType: 1 });
SeatAssignmentSchema.index({ tableId: 1, assignmentType: 1 });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.SeatAssignment) {
  delete models.SeatAssignment;
}

const SeatAssignment = models.SeatAssignment || mongoose.model<ISeatAssignment>('SeatAssignment', SeatAssignmentSchema);

export default SeatAssignment;
