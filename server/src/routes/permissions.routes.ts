import { Router } from 'express';
import { PermissionsController } from '../controllers/PermissionsController';
import { authenticate, hasPermission } from '../middleware/auth.middleware';
import { validation } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions
 * @access  Private (Admin only)
 */
router.get('/', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  PermissionsController.getAllPermissions
);

/**
 * @route   GET /api/permissions/modules
 * @desc    Get permissions grouped by module
 * @access  Private (Admin only)
 */
router.get('/modules', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  PermissionsController.getPermissionsByModule
);

/**
 * @route   GET /api/permissions/sets
 * @desc    Get permission sets
 * @access  Private (Admin only)
 */
router.get('/sets', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  PermissionsController.getPermissionSets
);

/**
 * @route   GET /api/permissions/user/:userId
 * @desc    Get user permissions
 * @access  Private (Admin or self)
 */
router.get('/user/:userId', 
  authenticate, 
  // User can view their own permissions, or an admin can view anyone's
  (req, res, next) => {
    const user = req.user;
    if (user._id.toString() === req.params.userId || user.permissions.includes('permissions:manage')) {
      return next();
    }
    return res.status(403).json({ 
      success: false, 
      message: 'You do not have permission to view this user\'s permissions'
    });
  },
  PermissionsController.getUserPermissions
);

/**
 * @route   POST /api/permissions/user/:userId/assign
 * @desc    Assign permissions to user
 * @access  Private (Admin only)
 */
router.post('/user/:userId/assign', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  validation({
    body: {
      permissions: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        required: true
      }
    }
  }),
  PermissionsController.assignPermissionsToUser
);

/**
 * @route   POST /api/permissions/user/:userId/revoke
 * @desc    Revoke permissions from user
 * @access  Private (Admin only)
 */
router.post('/user/:userId/revoke', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  validation({
    body: {
      permissions: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        required: true
      }
    }
  }),
  PermissionsController.revokePermissionsFromUser
);

/**
 * @route   PUT /api/permissions/user/:userId
 * @desc    Set user permissions (replace all)
 * @access  Private (Admin only)
 */
router.put('/user/:userId', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  validation({
    body: {
      permissions: {
        type: 'array',
        items: { type: 'string' },
        required: true
      }
    }
  }),
  PermissionsController.setUserPermissions
);

/**
 * @route   POST /api/permissions/user/:userId/set
 * @desc    Assign permission set to user
 * @access  Private (Admin only)
 */
router.post('/user/:userId/set', 
  authenticate, 
  hasPermission(['permissions:manage']), 
  validation({
    body: {
      setName: {
        type: 'string',
        required: true
      }
    }
  }),
  PermissionsController.assignPermissionSetToUser
);

export default router;