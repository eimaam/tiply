import { Request, Response } from "express";
import { UserModel, UserStatus } from "../models/User";
import { UserRoleEnum } from "../types/user.types";
import { UserRole } from "../models/UserRole";
import { responseHandler } from "../utils/responseHandler";
import { logger } from "../utils/logger";
import { defaultPermissionSets } from "../seeds/seed-data";
import { AuthenticatedRequest } from '../types/user.types';
import { sendSuccess, sendError, handleControllerError } from '../utils/responseHandler';
import mongoose from 'mongoose';

export class UserController {
  /**
   * Get all users (admin only)
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      // Build filter conditions
      const filter: any = {};

      // Filter by status if provided
      if (status) {
        filter.status = status;
      }

      // Search in username, email, or displayName if search term provided
      if (search) {
        const searchRegex = new RegExp(String(search), "i");
        filter.$or = [
          { username: searchRegex },
          { email: searchRegex },
          { displayName: searchRegex },
        ];
      }

      // Count total documents for pagination
      const totalUsers = await UserModel.countDocuments(filter);

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);

      // Get users with pagination
      const users = await UserModel.find(filter)
        .select(
          "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      return responseHandler.success(res, "Users retrieved successfully", {
        users,
        pagination: {
          total: totalUsers,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalUsers / Number(limit)),
        },
      });
    } catch (error) {
      logger.error("Error retrieving users:", error);
      return responseHandler.serverError(res, "Failed to retrieve users");
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id).select(
        "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
      );

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      return responseHandler.success(res, "User retrieved successfully", {
        user,
      });
    } catch (error) {
      logger.error("Error retrieving user:", error);
      return responseHandler.serverError(res, "Failed to retrieve user");
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      const user = await UserModel.findOne({ username }).select(
        "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires -email"
      );

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      return responseHandler.success(res, "User retrieved successfully", {
        user,
      });
    } catch (error) {
      logger.error("Error retrieving user by username:", error);
      return responseHandler.serverError(res, "Failed to retrieve user");
    }
  }

  /**
   * Update user profile
   * @param req - Express request object with user data from auth middleware
   * @param res - Express response object
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.user;
      const { displayName, bio, username, socialLinks, avatarUrl, coverImageUrl } = req.body;

      // Get current user
      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      // If username is being changed, check if it's available
      if (username && username !== user.username) {
        // Basic username validation
        if (username.length < 3) {
          return sendError({
            res,
            message: 'Username must be at least 3 characters long',
            statusCode: 400
          });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          return sendError({
            res,
            message: 'Username can only contain letters, numbers, and underscores',
            statusCode: 400
          });
        }

        // Check if username already exists
        const existingUser = await UserModel.findOne({ username, _id: { $ne: userId } });
        if (existingUser) {
          return sendError({
            res,
            message: 'This username is already taken',
            statusCode: 409
          });
        }
      }

      // Update fields if provided
      if (displayName) user.displayName = displayName;
      if (username) user.username = username;
      if (bio !== undefined) user.bio = bio; // Allow empty bio
      if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
      if (avatarUrl) user.avatarUrl = avatarUrl;
      if (coverImageUrl) user.coverImageUrl = coverImageUrl;

      // Save the updated user
      await user.save();

      return sendSuccess({
        res,
        message: 'Profile updated successfully! ✨',
        data: {
          displayName: user.displayName,
          username: user.username,
          bio: user.bio,
          socialLinks: user.socialLinks,
          avatarUrl: user.avatarUrl,
          coverImageUrl: user.coverImageUrl,
          withdrawalWalletAddress: user.withdrawalWalletAddress,
          depositWalletAddress: user.depositWalletAddress,
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return responseHandler.badRequest(res, "Current password is incorrect");
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return responseHandler.success(
        res,
        null,
        "Password updated successfully 🔐"
      );
    } catch (error) {
      logger.error("Error updating password:", error);
      return responseHandler.serverError(res, "Failed to update password");
    }
  }

  /**
   * Update user customization
   */
  static async updateCustomization(req: Request, res: Response) {
    try {
      const { userId } = req.user;
      const { customization } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      // Ensure user has permission to customize profile
      if (!user.permissions.includes("profile:customize")) {
        return responseHandler.forbidden(
          res,
          "You do not have permission to customize your profile"
        );
      }

      // Update customization
      user.customization = customization;
      await user.save();

      return responseHandler.success(
        res,
        "Profile customization updated successfully 🎨",
        {
          customization: user.customization,
        },
      );
    } catch (error) {
      logger.error("Error updating customization:", error);
      return responseHandler.serverError(res, "Failed to update customization");
    }
  }

  /**
   * Update user status (admin only)
   */
  static async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(UserStatus).includes(status as UserStatus)) {
        return responseHandler.badRequest(res, "Invalid status");
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).select("-password");

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      return responseHandler.success(
        res,
        { user },
        `User status updated to ${status} successfully`
      );
    } catch (error) {
      logger.error("Error updating user status:", error);
      return responseHandler.serverError(res, "Failed to update user status");
    }
  }

  /**
   * Delete user (admin or self)
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId, permissions } = req.user;

      // Check if user is deleting themselves or has admin permissions
      if (id !== userId && !permissions.includes("users:manage")) {
        return responseHandler.forbidden(
          res,
          "You do not have permission to delete this user"
        );
      }

      const deletedUser = await UserModel.findByIdAndDelete(id);

      if (!deletedUser) {
        return responseHandler.notFound(res, "User not found");
      }

      return responseHandler.success(res, "User deleted successfully", null);
    } catch (error) {
      logger.error("Error deleting user:", error);
      return responseHandler.serverError(res, "Failed to delete user");
    }
  }

  /**
   * Get featured creators
   */
  // static async getFeaturedCreators(req: Request, res: Response) {
  //   try {
  //     const featuredCreators = await UserModel.find({
  //       isFeatured: true,
  //       status: UserStatus.ACTIVE
  //     })
  //       .select('username displayName avatarUrl bio')
  //       .limit(10);

  //     return responseHandler.success(res, { creators: featuredCreators }, 'Featured creators retrieved successfully');
  //   } catch (error) {
  //     logger.error('Error retrieving featured creators:', error);
  //     return responseHandler.serverError(res, 'Failed to retrieve featured creators');
  //   }
  // }

  /**
   * Update user type - assigns role and default permissions
   * Maintains any additional custom permissions the user already has
   */
  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      if (!Object.values(UserRoleEnum).includes(role as UserRoleEnum)) {
        return responseHandler.badRequest(res, "Invalid role");
      }

      const user = await UserModel.findById(id);

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      // Store old role to log the change
      const oldRole = user.role;

      // Update role
      user.role = role as UserRoleEnum;

      // Get default permissions for this role
      const rolePermissions = defaultPermissionSets[role];

      if (!rolePermissions) {
        return responseHandler.badRequest(
          res,
          "Role has no defined permissions"
        );
      }

      // Merge default role permissions with any custom permissions the user already has
      // This preserves custom permissions that aren't part of the role's default set
      const existingCustomPermissions = user.permissions.filter(
        (permission:any) => !defaultPermissionSets[oldRole as keyof typeof defaultPermissionSets]?.includes(permission)
      );

      // Combine role permissions with custom permissions, remove duplicates
      user.permissions = [
        ...new Set([...rolePermissions, ...existingCustomPermissions]),
      ];

      await user.save();

      logger.info(`User ${id} role changed from ${oldRole} to ${role}`);

      return responseHandler.success(
        res,
        `User role updated to ${role} successfully ✨`,
        {
          role: user.role,
          permissions: user.permissions,
        },
      );
    } catch (error) {
      logger.error("Error updating user role:", error);
      return responseHandler.serverError(res, "Failed to update user role");
    }
  }

  /**
   * Add custom permission to user (in addition to role-based permissions)
   */
  static async addCustomPermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permission } = req.body;

      const user = await UserModel.findById(id);

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      // Add permission if it doesn't already exist
      if (!user.permissions.includes(permission)) {
        user.permissions.push(permission);
      }

      await user.save();

      return responseHandler.success(
        res,
        { permissions: user.permissions },
        `Custom permission '${permission}' added successfully 🔑`
      );
    } catch (error) {
      logger.error("Error adding custom permission:", error);
      return responseHandler.serverError(
        res,
        "Failed to add custom permission"
      );
    }
  }

  /**
   * Remove custom permission from user
   */
  static async removeCustomPermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permission } = req.body;

      const user = await UserModel.findById(id);

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      // Check if permission is part of user's role default permissions
      const rolePermissions = defaultPermissionSets[user.role as keyof typeof defaultPermissionSets] || [];
      if (rolePermissions.includes(permission)) {
        return responseHandler.badRequest(
          res,
          `Cannot remove '${permission}' as it's a default permission for the ${user.role} role. Change the user's role first.`
        );
      }

      // Remove permission
      user.permissions = user.permissions.filter((p:any) => p !== permission);
      await user.save();

      return responseHandler.success(
        res,
        `Custom permission '${permission}' removed successfully`,
        { permissions: user.permissions },
      );
    } catch (error) {
      logger.error("Error removing custom permission:", error);
      return responseHandler.serverError(
        res,
        "Failed to remove custom permission"
      );
    }
  }

  /**
   * Toggle featured status (admin only)
   */
  static async toggleFeatured(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);

      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }

      user.isFeatured = !user.isFeatured;
      await user.save();

      return responseHandler.success(
        res,
        user.isFeatured
          ? "User is now featured ⭐"
          : "User is no longer featured",
        { isFeatured: user.isFeatured }
      );
    } catch (error) {
      logger.error("Error toggling featured status:", error);
      return responseHandler.serverError(
        res,
        "Failed to toggle featured status"
      );
    }
  }

  /**
   * Update user's withdrawal wallet address
   * @param req - Express request object
   * @param res - Express response object
   */
  static async updateWalletAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.user;
      const { withdrawalWalletAddress } = req.body;

      if (!withdrawalWalletAddress) {
        return sendError({
          res,
          message: 'Withdrawal wallet address is required',
          statusCode: 400
        });
      }

      // Validate wallet address format (basic validation for Solana)
      if (!/^[a-zA-Z0-9]{32,44}$/.test(withdrawalWalletAddress)) {
        return sendError({
          res,
          message: 'Invalid wallet address format',
          statusCode: 400
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      // Update user with the new withdrawal wallet address
      user.withdrawalWalletAddress = withdrawalWalletAddress;
      await user.save();

      return sendSuccess({
        res,
        message: 'Withdrawal wallet address updated successfully! 💼',
        data: {
          withdrawalWalletAddress: user.withdrawalWalletAddress
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Check if a username is available
   * @param req - Express request object
   * @param res - Express response object
   */
  static async checkUsernameAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      const { username } = req.params;
      
      // Basic username validation
      if (!username || username.length < 3) {
        return sendError({
          res,
          message: 'Username must be at least 3 characters long',
          statusCode: 400
        });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return sendError({
          res,
          message: 'Username can only contain letters, numbers, and underscores',
          statusCode: 400
        });
      }

      // Check if username exists (excluding current user)
      const existingUser = await UserModel.findOne({ 
        username, 
        _id: { $ne: req.user.userId } 
      });

      if (existingUser) {
        return sendError({
          res,
          message: 'This username is already taken 😕',
          statusCode: 409
        });
      }

      return sendSuccess({
        res,
        message: 'Username is available! 🎉',
        data: {
          available: true
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
