/**
 * Collection of type definitions for user-related functionality
 */

import { UserStatus, OnboardingStep } from '../models/User';
import { Request } from 'express';

// Pre-defined role types that match our database
export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
  SUPPORT = 'support',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// JWT payload structure
export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions?: string[];
}

// New AuthenticatedRequest type to use after authentication
export interface AuthenticatedRequest extends Request {
  user: JwtPayload; // Note: Not optional - guaranteed to exist
}

// Login request body
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request body
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// User response sent to client (excludes sensitive fields)
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  walletAddress?: string;
  status: UserStatus;
  roles: string[];
  permissions?: string[];
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
  token: string;
  expiresIn: number;
  user: UserResponse;
}

// Permission check request
export interface PermissionCheckRequest {
  permissions: string[];
  requireAll?: boolean; // If true, user must have ALL permissions, otherwise ANY is sufficient
}

// Role-based access control check function type
export type RolePermissionCheck = (
  roles: string[],
  permissions: string[],
  requireAllPermissions?: boolean
) => boolean;