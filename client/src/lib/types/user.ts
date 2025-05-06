/**
 * User-related types and enums
 */

/**
 * Enum for user roles
 */
export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

/**
 * Enum for user account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  BANNED = 'banned'
}

/**
 * Enum for onboarding steps
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
 * Interface for user data
 */
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  depositWalletAddress?: string; // Circle-generated deposit wallet address
  withdrawalWalletAddress?: string; // User's personal withdrawal wallet address
  circleWalletId?: string;
  socialLinks?: SocialLinks;
  customization?: ProfileCustomization;
  onboardingCompleted: boolean;
  currentOnboardingStep?: OnboardingStep;
  permissions: string[];
  emailVerified: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  balance?: number; 
}

/**
 * Interface for user profile data
 */
export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  socialLinks?: SocialLinks;
  customization?: ProfileCustomization;
  tipStats?: {
    totalReceived: number;
    tipCount: number;
  };
}

/**
 * Interface for social media links
 */
export interface SocialLinks {
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
 * Interface for profile customization
 */
export interface ProfileCustomization {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: string;
  customCss?: string;
  showTipCounter?: boolean;
  enableCustomMessage?: boolean;
  tipOptions?: TipOption[];
}

/**
 * Interface for tip option
 */
export interface TipOption {
  id: string;
  amount: number;
  label?: string;
  isDefault?: boolean;
}

/**
 * Interface for authentication data
 */
export interface AuthData {
  user: User;
  token: string;
  expiresIn: number;
}

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for signup data
 */
export interface SignupData extends LoginCredentials {
  username: string;
  displayName?: string;
}

/**
 * Interface for password reset data
 */
export interface PasswordResetData {
  email: string;
  token?: string;
  newPassword?: string;
}