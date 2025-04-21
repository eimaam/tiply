import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for UserRole document
 * This handles the many-to-many relationship between users and roles
 * and provides additional metadata about the role assignment
 */
export interface IUserRole extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId; // Which admin assigned this role
  assignedAt: Date;
  expiresAt?: Date; // Optional expiration date for temporary roles
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for UserRole model
 */
const UserRoleSchema = new Schema<IUserRole>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
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

// Create compound index for userId + roleId
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
// Create index for querying active roles
UserRoleSchema.index({ userId: 1, isActive: 1 });
// Create index for checking expired roles
UserRoleSchema.index({ expiresAt: 1 });

export const UserRole = mongoose.model<IUserRole>('UserRole', UserRoleSchema);