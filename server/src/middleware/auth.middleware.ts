import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { responseHandler } from '../utils/responseHandler';
import { logger } from '../utils/logger';
import { AuthenticatedRequest, JwtPayload } from '../types/user.types';
import { JWT } from '../config/env.config';

/**
 * Authentication Middleware
 * Authenticates a user by JWT token from cookie, attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get JWT token from access token cookie as primary source
    const accessToken = req.cookies.accessToken;
    
    // Fallback to Authorization header if no cookie is present (for API clients)
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.split(' ')[1];
    
    // Use token from cookie or header
    const authToken = accessToken || headerToken;

    if (!authToken) {
      // If no valid token but there is a refresh token, redirect to refresh endpoint
      if (req.cookies.refreshToken && req.path !== '/api/v1/auth/refresh') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired. Refresh required.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return responseHandler.unauthorized(res, 'Access denied. Not authenticated 🔒');
    }

    try {
      // Verify the token
      const decoded = jwt.verify(authToken, JWT.SECRET) as JwtPayload;
      
      // Validate that this is an access token, not a refresh token
      if (decoded.tokenType && decoded.tokenType !== 'access') {
        return responseHandler.unauthorized(res, 'Invalid token type 🔑');
      }
      
      // Find the user by id
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        return responseHandler.unauthorized(res, 'Invalid token. User not found 👻');
      }
      
      // Check if user is active
      if (user.status !== 'active' && user.status !== 'pending') {
        return responseHandler.unauthorized(res, `Account is ${user.status}. Please contact support 🔒`);
      }

      // Attach user data to request object
      req.user = decoded;
      next();
    } catch (error) {
      // Check if token is expired
      if (error instanceof jwt.TokenExpiredError) {
        // If there's a refresh token, let the client know they should refresh
        if (req.cookies.refreshToken && req.path !== '/api/v1/auth/refresh') {
          return res.status(401).json({
            success: false,
            message: 'Access token expired. Refresh required.',
            code: 'TOKEN_EXPIRED'
          });
        }
      }
      
      logger.error('JWT Verification error:', error);
      return responseHandler.unauthorized(res, 'Invalid token 🔑');
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return responseHandler.serverError(res, 'Authentication process failed 😵');
  }
};

/**
 * Permission middleware - checks if the user has required permissions
 * @param requiredPermissions - Array of permission slugs required to access the route
 */
export const hasPermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return responseHandler.unauthorized(res, 'Access denied. Please log in 🔒');
      }

      // Check if user has any of the required permissions
      const hasRequiredPermission = requiredPermissions.some(permission => 
        user.permissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        logger.warn(`Permission denied: User ${user.userId} lacks permissions: ${requiredPermissions.join(', ')}`);
        return responseHandler.forbidden(res, 'You do not have permission to perform this action 🚫');
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return responseHandler.serverError(res, 'Permission check failed 🔍');
    }
  };
};


/**
 * Role middleware - checks if user has required roles
 * @param requiredRoles - Array of role slugs required to access the route
 */

export const hasRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return responseHandler.unauthorized(res, 'Access denied. Please log in 🔒');
      }

      // User role field accepts only a single role - Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role =>
        user.role === role
      );
      if (!hasRequiredRole) {
        logger.warn(`Role denied: User ${user.userId} lacks roles: ${requiredRoles.join(', ')}`);
        return responseHandler.forbidden(res, 'You do not have permission to perform this action 🚫') ;
      }

      // Check if user has admin permission to bypass role check
      if (user.permissions.includes('users:manage')) {
        return next();
      }

      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      return responseHandler.serverError(res, 'Role check failed 🔍');
    }
  };
};

/**
 * Resource owner middleware - checks if user owns the requested resource
 * @param getResourceOwnerId - Function to extract the owner ID from the request
 */
export const isResourceOwner = (getResourceOwnerId: (req: Request) => Promise<string | null>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return responseHandler.unauthorized(res, 'Access denied. Please log in 🔒');
      }

      // Check if user has admin permission to bypass ownership check
      if (user.permissions.includes('users:manage')) {
        return next();
      }

      // Get resource owner ID
      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId) {
        return responseHandler.notFound(res, 'Resource not found 🔍');
      }

      // Check if the user is the owner
      if (user.userId.toString() !== ownerId.toString()) {
        logger.warn(`Resource access denied: User ${user.userId} attempted to access resource owned by ${ownerId}`);
        return responseHandler.forbidden(res, 'You do not have permission to access this resource 🔒');
      }

      next();
    } catch (error) {
      logger.error('Resource owner middleware error:', error);
      return responseHandler.serverError(res, 'Ownership verification failed 🛡️');
    }
  };
};

/**
 * Type-safe wrapper for controller methods that require authentication
 * This solves the TypeScript error when using AuthenticatedRequest with Express routes
 */
export const withAuth = <T extends (...args: any[]) => any>(handler: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res, next);
  };
};