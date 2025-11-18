import mongoose, { Schema, models } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
  password?: string;
  role: 'couple' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      // Password is optional because Google OAuth users won't have one
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['couple', 'admin'],
      default: 'couple',
    },
  },
  {
    timestamps: true,
  }
);

// No need to create additional index for email as it's already indexed via unique: true

const User = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
