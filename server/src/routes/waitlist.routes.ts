import express from 'express';
import WaitlistController from '../controllers/WaitlistController';
import { authenticate, hasRole, withAuth } from '../middleware/auth.middleware';
import { UserRoleEnum } from '../types/user.types';


const router = express.Router();

// Public route - anyone can join the waitlist
router.post('/', WaitlistController.joinWaitlist);

// Protected route - only admins can view the waitlist
router.get('/', 
  authenticate, 
  hasRole([UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN]), 
  withAuth(WaitlistController.getWaitlist)
);

export default router;