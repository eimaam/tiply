import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IRole } from './Role';

/**
 * User Status Enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  BANNED = 'banned',
  LOCKED = 'locked',
}

/**
 * Onboarding Step Enum
 */
export enum OnboardingStep {
  USERNAME = 'username',
  PROFILE = 'profile',
  AVATAR = 'avatar',
  WALLET = 'wallet',
  CUSTOMIZE = 'customize',
  COMPLETE = 'complete'
}

/**
 * Interface for Social Links
 */
export interface ISocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  twitch?: string;
  tiktok?: string;
  website?: string;
  discord?: string;
  github?: string;
}

/**
 * Interface for Tip Option
 */
export interface ITipOption {
  amount: number;
  label?: string;
  isDefault?: boolean;
}

/**
 * Interface for Profile Customization
 */
export interface IProfileCustomization {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: string;
  customCss?: string;
  showTipCounter?: boolean;
  enableCustomMessage?: boolean;
  tipOptions?: ITipOption[];
  minimumTipAmount?: number;
  allowCustomAmounts?: boolean;
  receiveNotes?: boolean;
}

/**
 * Interface for User document
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  walletAddress?: string;
  status: UserStatus;
  roles: mongoose.Types.ObjectId[] | IRole[];
  socialLinks?: ISocialLinks;
  customization?: IProfileCustomization;
  onboardingCompleted: boolean;
  currentOnboardingStep?: OnboardingStep;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  failedLoginAttempts?: number;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Schema for User model
 */
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    displayName: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    coverImageUrl: {
      type: String,
      trim: true,
    },
    walletAddress: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    roles: [{
      type: Schema.Types.ObjectId,
      ref: 'Role',
    }],
    socialLinks: {
      twitter: String,
      instagram: String,
      youtube: String,
      twitch: String,
      tiktok: String,
      website: String,
      discord: String,
      github: String,
    },
    customization: {
      primaryColor: String,
      backgroundColor: String,
      fontFamily: String,
      buttonStyle: String,
      customCss: String,
      showTipCounter: { type: Boolean, default: true },
      enableCustomMessage: { type: Boolean, default: true },
      tipOptions: [{
        amount: { type: Number, required: true },
        label: String,
        isDefault: { type: Boolean, default: false },
      }],
      minimumTipAmount: { type: Number, default: 1 },
      allowCustomAmounts: { type: Boolean, default: true },
      receiveNotes: { type: Boolean, default: true },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    currentOnboardingStep: {
      type: String,
      enum: Object.values(OnboardingStep),
      default: OnboardingStep.USERNAME,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isFeatured: 1, status: 1 });

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);