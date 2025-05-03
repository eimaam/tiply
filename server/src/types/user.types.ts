/**
 * Collection of type definitions for user-related functionality
 */

import { UserStatus, OnboardingStep } from '../models/User';
import { Request } from 'express';

/**
 * User Role Enum
 */
export enum UserRoleEnum {
  CREATOR = 'creator',
  SUPPORT = 'support',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// JWT payload structure
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRoleEnum; 
  permissions: string[];
  tokenType?: 'access' | 'refresh'; // Indicate token type
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// For backward compatibility
export interface AuthenticatedRequest extends Request {
  user: JwtPayload; 
}

// Login request body
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request body
export interface RegisterRequest {
  email: string;
  password: string;
}

// Refresh token request body
export interface TokenRefreshRequest {
  refreshToken?: string; // Optional since we'll primarily use cookies
}

// User response sent to client (excludes sensitive fields)
export interface UserResponse {
  id: string;
  username?: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  walletAddress?: string;
  status: UserStatus;
  role: UserRoleEnum;
  permissions: string[];
  socialLinks?: Record<string, string>;
  customization?: Record<string, any>;
  onboardingCompleted: boolean;
  currentOnboardingStep?: OnboardingStep;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth response containing token and user data
export interface AuthResponse {
  accessToken?: string; // Optional as we'll use cookies primarily
  refreshToken?: string; // Optional as we'll use cookies primarily
  accessExpiresIn: string;
  refreshExpiresIn: string;
  user: UserResponse;
}

// Permission check request
export interface PermissionCheckRequest {
  permissions: string[];
  requireAll?: boolean; // If true, user must have ALL permissions, otherwise ANY is sufficient
}

// Token response for refresh endpoints
export interface TokenResponse {
  accessToken?: string;
  accessExpiresIn: string;
}