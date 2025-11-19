import mongoose, { Schema, models, Types } from 'mongoose';

export interface IAdminLog {
  _id: string;
  userId: Types.ObjectId | string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      // Ensure proper UTF-8 encoding
      set: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
      get: (value: string) => Buffer.from(value, 'utf8').toString('utf8'),
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
AdminLogSchema.index({ userId: 1 });
AdminLogSchema.index({ action: 1 });
AdminLogSchema.index({ timestamp: -1 });

const AdminLog = models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);

export default AdminLog;
