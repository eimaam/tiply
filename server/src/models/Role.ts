import mongoose, { Document, Schema } from 'mongoose';
import { IPermission } from './Permission';

/**
 * Interface for Role document
 */
export interface IRole extends Document {
  name: string;
  description: string;
  slug: string;
  isDefault: boolean;
  permissions: mongoose.Types.ObjectId[] | IPermission[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for Role model
 */
const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    permissions: [{
      type: Schema.Types.ObjectId,
      ref: 'Permission',
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
RoleSchema.index({ slug: 1 });
RoleSchema.index({ isDefault: 1 });

export const Role = mongoose.model<IRole>('Role', RoleSchema);