import mongoose, { Schema, Document } from 'mongoose';

export interface IPackagePricing extends Document {
  guests: number;
  price: number;
  label: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackagePricingSchema = new Schema<IPackagePricing>(
  {
    guests: {
      type: Number,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    label: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Sort by guests ascending when querying
PackagePricingSchema.index({ guests: 1 });

export default mongoose.models.PackagePricing || mongoose.model<IPackagePricing>('PackagePricing', PackagePricingSchema);
