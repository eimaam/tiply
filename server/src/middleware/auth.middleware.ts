import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import { JwtPayload, AuthenticatedRequest } from "../types/user.types";
import { UserModel } from "../models/User";
import { JWT } from "../config/env.config";
import { logger } from "../utils/logger";

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate user based on JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    // Verify the token
    const secret = JWT.SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    try {
      // Decode the token
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Add user information to request with type casting
      (req as AuthenticatedRequest).user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please authenticate again.",
      });
    }
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/**
 * Middleware to check if user has the required role(s)
 * @param roles - Array of roles that can access the route
 */
export const hasRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // If user has any of the specified roles, allow access
      const userRoles = req.user.roles || [];
      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      logger.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during permission check.",
      });
    }
  };
};

/**
 * Middleware to check if user has the required permission(s)
 * @param permissions - Array of permission slugs required to access the route
 * @param requireAll - If true, the user must have all specified permissions
 */
export const hasPermission = (permissions: string[], requireAll = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID not found in token.",
        });
      }

      // Get user from database with populated roles and permissions
      const user = await UserModel.findById(userId).select("_id");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found.",
        });
      }

      // Find active roles for the user
      const userRoles = await UserRole.find({
        userId: user._id,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      }).populate({
        path: "roleId",
        model: "Role",
        populate: {
          path: "permissions",
          model: "Permission",
          select: "slug",
        },
      });

      // Extract permission slugs from user roles
      const userPermissions = new Set<string>();
      userRoles.forEach((userRole) => {
        const role = userRole.roleId as any;
        if (role && role.permissions) {
          role.permissions.forEach((permission: any) => {
            if (permission.slug) {
              userPermissions.add(permission.slug);
            }
          });
        }
      });

      // Check if user has the required permissions
      let hasAccess = false;
      if (requireAll) {
        // User must have ALL specified permissions
        hasAccess = permissions.every((perm) => userPermissions.has(perm));
      } else {
        // User needs ANY of the specified permissions
        hasAccess = permissions.some((perm) => userPermissions.has(perm));
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      logger.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during permission check.",
      });
    }
  };
};
