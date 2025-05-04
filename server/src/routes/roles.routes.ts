import { Router } from 'express';
import { RolesController } from '../controllers/RolesController';
import { authenticate, withAuth, hasRole } from '../middleware/auth.middleware';
import { adminRateLimiter } from '../middleware/rate-limit.middleware';
import { UserRoleEnum } from '../types/user.types';


const router = Router();

/**
 * Roles and Permissions Routes
 * All routes require admin privileges
 */

// Apply admin rate limiter to all admin routes

// Roles routes
router.get('/roles', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.getAllRoles)
);

router.get('/roles/:roleId', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.getRoleById)
);

router.post('/roles', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.createRole)
);

router.put('/roles/:roleId', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.updateRole)
);

router.delete('/roles/:roleId', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.deleteRole)
);

// Permissions routes
router.get('/permissions', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.getAllPermissions)
);

router.post('/permissions', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.createPermission)
);

router.put('/permissions/:permissionId', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.updatePermission)
);

router.delete('/permissions/:permissionId', 
  authenticate,
  hasRole([UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]),
  adminRateLimiter,
  withAuth(RolesController.deletePermission)
);

export default router;