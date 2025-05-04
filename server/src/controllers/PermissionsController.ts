import { Request, Response } from 'express';
import { Permission } from '../models/Permission';
import { UserModel } from '../models/User';
import { responseHandler } from '../utils/responseHandler';
import { logger } from '../utils/logger';
import { defaultPermissionSets } from '../seeds/seed-data';

export class PermissionsController {
  /**
   * Get all permissions in the system
   */
  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await Permission.find().sort({ module: 1, name: 1 });
      return responseHandler.success(res, permissions, 'Permissions retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving permissions:', error);
      return responseHandler.serverError(res, 'Failed to retrieve permissions');
    }
  }

  /**
   * Get permissions grouped by module
   */
  static async getPermissionsByModule(req: Request, res: Response) {
    try {
      const permissions = await Permission.find().sort({ module: 1, name: 1 });
      
      // Group permissions by module
      const modulePermissions = permissions.reduce((result: Record<string, any[]>, permission) => {
        if (!result[permission.module]) {
          result[permission.module] = [];
        }
        result[permission.module].push(permission);
        return result;
      }, {});
      
      return responseHandler.success(res, modulePermissions, 'Permissions grouped by module retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving permissions by module:', error);
      return responseHandler.serverError(res, 'Failed to retrieve permissions by module');
    }
  }

  /**
   * Get standard permission sets (useful for quick assignment)
   */
  static async getPermissionSets(req: Request, res: Response) {
    try {
      return responseHandler.success(res, defaultPermissionSets, 'Permission sets retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving permission sets:', error);
      return responseHandler.serverError(res, 'Failed to retrieve permission sets');
    }
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return responseHandler.notFound(res, 'User not found');
      }
      
      // If we need more details about permissions, we can lookup full permission objects
      if (req.query.detailed === 'true') {
        const permissionDetails = await Permission.find({
          slug: { $in: user.permissions }
        });
        return responseHandler.success(res, permissionDetails, 'User permissions retrieved successfully');
      }
      
      return responseHandler.success(res, user.permissions, 'User permissions retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving user permissions:', error);
      return responseHandler.serverError(res, 'Failed to retrieve user permissions');
    }
  }

  /**
   * Assign permissions to user
   */
  static async assignPermissionsToUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return responseHandler.badRequest(res, 'Please provide an array of permission slugs');
      }
      
      // Verify all permissions exist
      const permissionsExist = await Permission.countDocuments({
        slug: { $in: permissions }
      });
      
      if (permissionsExist !== permissions.length) {
        return responseHandler.badRequest(res, 'One or more permissions are invalid');
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return responseHandler.notFound(res, 'User not found');
      }
      
      // Add permissions without duplicates
      const updatedPermissions = [...new Set([...user.permissions, ...permissions])];
      
      await UserModel.findByIdAndUpdate(userId, {
        $set: { permissions: updatedPermissions }
      });
      
      logger.info(`User ${userId} assigned permissions: ${permissions.join(', ')}`);
      return responseHandler.success(res, { permissions: updatedPermissions }, 'Permissions assigned successfully');
    } catch (error) {
      logger.error('Error assigning permissions to user:', error);
      return responseHandler.serverError(res, 'Failed to assign permissions to user');
    }
  }

  /**
   * Revoke permissions from user
   */
  static async revokePermissionsFromUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return responseHandler.badRequest(res, 'Please provide an array of permission slugs');
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return responseHandler.notFound(res, 'User not found');
      }
      
      // Remove specified permissions
      const updatedPermissions = user.permissions.filter(p => !permissions.includes(p));
      
      await UserModel.findByIdAndUpdate(userId, {
        $set: { permissions: updatedPermissions }
      });
      
      logger.info(`User ${userId} revoked permissions: ${permissions.join(', ')}`);
      return responseHandler.success(res, { permissions: updatedPermissions }, 'Permissions revoked successfully');
    } catch (error) {
      logger.error('Error revoking permissions from user:', error);
      return responseHandler.serverError(res, 'Failed to revoke permissions from user');
    }
  }

  /**
   * Set permissions for user (replace all existing permissions)
   */
  static async setUserPermissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions)) {
        return responseHandler.badRequest(res, 'Please provide an array of permission slugs');
      }
      
      // Verify all permissions exist if array is not empty
      if (permissions.length > 0) {
        const permissionsExist = await Permission.countDocuments({
          slug: { $in: permissions }
        });
        
        if (permissionsExist !== permissions.length) {
          return responseHandler.badRequest(res, 'One or more permissions are invalid');
        }
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return responseHandler.notFound(res, 'User not found');
      }
      
      // Replace all permissions
      await UserModel.findByIdAndUpdate(userId, {
        $set: { permissions: permissions }
      });
      
      logger.info(`User ${userId} permissions set to: ${permissions.join(', ')}`);
      return responseHandler.success(res, { permissions }, 'User permissions set successfully');
    } catch (error) {
      logger.error('Error setting user permissions:', error);
      return responseHandler.serverError(res, 'Failed to set user permissions');
    }
  }

  /**
   * Assign a predefined permission set to a user
   */
  static async assignPermissionSetToUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { setName } = req.body;
      
      if (!setName || !defaultPermissionSets[setName]) {
        return responseHandler.badRequest(res, 'Invalid permission set name');
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return responseHandler.notFound(res, 'User not found');
      }
      
      // Get permissions from the selected set
      const permissionsToAdd = defaultPermissionSets[setName];
      
      // Add permissions without duplicates
      const updatedPermissions = [...new Set([...user.permissions, ...permissionsToAdd])];
      
      await UserModel.findByIdAndUpdate(userId, {
        $set: { permissions: updatedPermissions }
      });
      
      logger.info(`User ${userId} assigned permission set: ${setName}`);
      return responseHandler.success(
        res, 
        { permissions: updatedPermissions }, 
        `Permission set "${setName}" assigned successfully ✨`
      );
    } catch (error) {
      logger.error('Error assigning permission set to user:', error);
      return responseHandler.serverError(res, 'Failed to assign permission set to user');
    }
  }
}