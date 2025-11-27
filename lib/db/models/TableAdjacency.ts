import mongoose, { Schema, models, Types } from 'mongoose';

export interface ITableAdjacency {
  _id: string;
  weddingId: Types.ObjectId | string;
  tableId: Types.ObjectId | string;
  adjacentTableId: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const TableAdjacencySchema = new Schema<ITableAdjacency>(
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
    adjacentTableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Adjacent Table ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
TableAdjacencySchema.index({ weddingId: 1 });
TableAdjacencySchema.index({ weddingId: 1, tableId: 1 });
TableAdjacencySchema.index({ weddingId: 1, tableId: 1, adjacentTableId: 1 }, { unique: true });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.TableAdjacency) {
  delete models.TableAdjacency;
}

const TableAdjacency = models.TableAdjacency || mongoose.model<ITableAdjacency>('TableAdjacency', TableAdjacencySchema);

export default TableAdjacency;
