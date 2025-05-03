import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for Permission document
 */
export interface IPermission extends Document {
  name: string;
  description: string;
  slug: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for Permission model
 */
const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
PermissionSchema.index({ slug: 1 }, { unique: true });
PermissionSchema.index({ module: 1 });

export const Permission = mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);