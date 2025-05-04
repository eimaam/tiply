import { Request, Response } from 'express';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import mongoose from 'mongoose';

/**
 * Roles and Permissions Controller
 */
export class RolesController {
  /**
   * Get all roles with their permissions
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await Role.find().populate('permissions');
      
      return res.status(200).json({
        success: true,
        data: { roles },
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get a specific role by ID
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getRoleById(req: Request, res: Response) {
    try {
      const { roleId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
        });
      }

      const role = await Role.findById(roleId).populate('permissions');
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: { role },
      });
    } catch (error) {
      console.error('Get role by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new role
   * @param req - Express request object
   * @param res - Express response object
   */
  static async createRole(req: Request, res: Response) {
    try {
      const { name, description, slug, permissions = [], isDefault = false } = req.body;

      // Validate required fields
      if (!name || !description || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, and slug are required',
        });
      }

      // Check if role with slug already exists
      const existingRole = await Role.findOne({ slug });
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: 'Role with this slug already exists',
        });
      }

      // Validate permissions if provided
      if (permissions.length > 0) {
        // Check if all permission IDs are valid
        const validPermissions = await Permission.find({
          _id: { $in: permissions },
        });

        if (validPermissions.length !== permissions.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more permission IDs are invalid',
          });
        }
      }

      // Create new role
      const role = new Role({
        name,
        description,
        slug,
        permissions,
        isDefault,
      });

      await role.save();

      return res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { role },
      });
    } catch (error) {
      console.error('Create role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update a role
   * @param req - Express request object
   * @param res - Express response object
   */
  static async updateRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const { name, description, permissions, isDefault } = req.body;

      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
        });
      }

      // Find role by ID
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Update fields if provided
      if (name !== undefined) role.name = name;
      if (description !== undefined) role.description = description;
      if (isDefault !== undefined) role.isDefault = isDefault;

      // Update permissions if provided
      if (permissions !== undefined && Array.isArray(permissions)) {
        // Validate permissions
        const validPermissions = await Permission.find({
          _id: { $in: permissions },
        });

        if (validPermissions.length !== permissions.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more permission IDs are invalid',
          });
        }

        role.permissions = permissions;
      }

      await role.save();

      return res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: { role },
      });
    } catch (error) {
      console.error('Update role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete a role
   * @param req - Express request object
   * @param res - Express response object
   */
  static async deleteRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
        });
      }

      // Find role by ID
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Don't allow deletion of default roles
      if (role.isDefault) {
        return res.status(403).json({
          success: false,
          message: 'Default roles cannot be deleted',
        });
      }

      // Delete role
      await Role.findByIdAndDelete(roleId);

      return res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      console.error('Delete role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all permissions
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await Permission.find();
      
      return res.status(200).json({
        success: true,
        data: { permissions },
      });
    } catch (error) {
      console.error('Get all permissions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new permission
   * @param req - Express request object
   * @param res - Express response object
   */
  static async createPermission(req: Request, res: Response) {
    try {
      const { name, description, slug, module } = req.body;

      // Validate required fields
      if (!name || !description || !slug || !module) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, slug, and module are required',
        });
      }

      // Check if permission with slug already exists
      const existingPermission = await Permission.findOne({ slug });
      if (existingPermission) {
        return res.status(409).json({
          success: false,
          message: 'Permission with this slug already exists',
        });
      }

      // Create new permission
      const permission = new Permission({
        name,
        description,
        slug,
        module,
      });

      await permission.save();

      return res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: { permission },
      });
    } catch (error) {
      console.error('Create permission error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update a permission
   * @param req - Express request object
   * @param res - Express response object
   */
  static async updatePermission(req: Request, res: Response) {
    try {
      const { permissionId } = req.params;
      const { name, description, module } = req.body;

      if (!mongoose.Types.ObjectId.isValid(permissionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid permission ID',
        });
      }

      // Find permission by ID
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
      }

      // Update fields if provided
      if (name !== undefined) permission.name = name;
      if (description !== undefined) permission.description = description;
      if (module !== undefined) permission.module = module;

      await permission.save();

      return res.status(200).json({
        success: true,
        message: 'Permission updated successfully',
        data: { permission },
      });
    } catch (error) {
      console.error('Update permission error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete a permission
   * @param req - Express request object
   * @param res - Express response object
   */
  static async deletePermission(req: Request, res: Response) {
    try {
      const { permissionId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(permissionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid permission ID',
        });
      }

      // Find permission by ID
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
      }

      // Check if permission is in use by any roles
      const rolesUsingPermission = await Role.countDocuments({
        permissions: permission._id,
      });

      if (rolesUsingPermission > 0) {
        return res.status(409).json({
          success: false,
          message: 'Permission is in use by one or more roles and cannot be deleted',
        });
      }

      // Delete permission
      await Permission.findByIdAndDelete(permissionId);

      return res.status(200).json({
        success: true,
        message: 'Permission deleted successfully',
      });
    } catch (error) {
      console.error('Delete permission error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}