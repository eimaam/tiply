import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, hasPermission, withAuth } from '../middleware/auth.middleware';
import { validations, validation } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route GET /api/v1/users
 * @desc Get all users (admin only)
 * @access Private
 */
router.get('/',
  authenticate,
  hasPermission(['users:manage']),
  withAuth(UserController.getAllUsers)
);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id',
  authenticate,
  (req, res, next) => {
    // Allow if user is accessing their own profile or has admin permission
    if (req.user?.userId === req.params.id || req.user?.permissions.includes('users:manage')) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this user profile 🔒'
    });
  },
  withAuth(UserController.getUserById)
);

/**
 * @route GET /api/v1/users/username/:username
 * @desc Get user by username
 * @access Public
 */
router.get('/username/:username',
  UserController.getUserByUsername
);

/**
 * @route GET /api/v1/users/profile/:username
 * @desc Get public profile for tipping page by username
 * @access Public
 */
router.get('/profile/:username',
  UserController.getUserByUsername
);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  authenticate,
  validation({
    body: {
      displayName: { type: 'string', optional: true },
      bio: { type: 'string', optional: true },
      socialLinks: { type: 'object', optional: true },
      avatarUrl: { type: 'string', optional: true },
      coverImageUrl: { type: 'string', optional: true }
    }
  }),
  withAuth(UserController.updateProfile)
);

/**
 * @route PUT /api/v1/users/profile/wallet
 * @desc Update withdrawal wallet address
 * @access Private
 */
router.put('/profile/wallet',
  authenticate,
  validation({
    body: {
      withdrawalWalletAddress: { type: 'string', required: true }
    }
  }),
  withAuth(UserController.updateWalletAddress)
);

/**
 * @route PUT /api/v1/users/password
 * @desc Update user password
 * @access Private
 */
router.put('/password',
  authenticate,
  validation({
    body: {
      currentPassword: { type: 'string', required: true },
      newPassword: { type: 'string', required: true, minLength: 8 }
    }
  }),
  withAuth(UserController.updatePassword)
);

/**
 * @route PUT /api/v1/users/customization
 * @desc Update user customization
 * @access Private
 */
router.put('/customization',
  authenticate,
  hasPermission(['profile:customize']),
  validation({
    body: {
      customization: { type: 'object', required: true }
    }
  }),
  withAuth(UserController.updateCustomization)
);

/**
 * @route PUT /api/v1/users/:id/status
 * @desc Update user status (admin only)
 * @access Private
 */
router.put('/:id/status',
  authenticate,
  hasPermission(['users:manage']),
  validation({
    body: {
      status: { type: 'string', required: true }
    }
  }),
  withAuth(UserController.updateUserStatus)
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete user (admin or self)
 * @access Private
 */
router.delete('/:id',
  authenticate,
  withAuth(UserController.deleteUser)
);

/**
 * @route GET /api/v1/users/featured/creators
 * @desc Get featured creators
 * @access Public
 */
// router.get('/featured/creators',
//   UserController.getFeaturedCreators
// );

/**
 * @route PUT /api/v1/users/:id/role
 * @desc Update user role with default permissions (admin only)
 * @access Private
 */
router.put('/:id/role',
  authenticate,
  hasPermission(['permissions:manage']),
  validation({
    body: {
      role: { type: 'string', required: true }
    }
  }),
  withAuth(UserController.updateUserRole)
);

/**
 * @route POST /api/v1/users/:id/permissions
 * @desc Add custom permission to user (admin only)
 * @access Private
 */
router.post('/:id/permissions',
  authenticate,
  hasPermission(['permissions:manage']),
  validation({
    body: {
      permission: { type: 'string', required: true }
    }
  }),
  withAuth(UserController.addCustomPermission)
);

/**
 * @route DELETE /api/v1/users/:id/permissions
 * @desc Remove custom permission from user (admin only)
 * @access Private
 */
router.delete('/:id/permissions',
  authenticate,
  hasPermission(['permissions:manage']),
  validation({
    body: {
      permission: { type: 'string', required: true }
    }
  }),
  withAuth(UserController.removeCustomPermission)
);

/**
 * @route PUT /api/v1/users/:id/featured
 * @desc Toggle featured status (admin only)
 * @access Private
 */
router.put('/:id/featured',
  authenticate,
  hasPermission(['creators:feature']),
  withAuth(UserController.toggleFeatured)
);

// Tip settings routes
router.get('/tip-settings', authenticate, UserController.getTipSettings);
router.put('/tip-settings', authenticate, UserController.updateTipSettings);

export default router;