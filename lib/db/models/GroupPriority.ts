import mongoose, { Schema, models, Types } from 'mongoose';

export interface IGroupPriority {
  _id: string;
  weddingId: Types.ObjectId | string;
  groupName: string; // The familyGroup name
  priority: number; // 1 = first table, 2 = second, etc. 0 = no priority
  createdAt: Date;
  updatedAt: Date;
}

const GroupPrioritySchema = new Schema<IGroupPriority>(
  {
    weddingId: {
      type: Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding ID is required'],
    },
    groupName: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    priority: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
GroupPrioritySchema.index({ weddingId: 1 });
GroupPrioritySchema.index({ weddingId: 1, groupName: 1 }, { unique: true });
GroupPrioritySchema.index({ weddingId: 1, priority: 1 });

// Delete cached model in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && models.GroupPriority) {
  delete models.GroupPriority;
}

const GroupPriority = models.GroupPriority || mongoose.model<IGroupPriority>('GroupPriority', GroupPrioritySchema);

export default GroupPriority;
