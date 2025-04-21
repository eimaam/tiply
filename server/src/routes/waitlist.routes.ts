import express from 'express';
import WaitlistController from '../controllers/WaitlistController';
import { authenticate, hasRole } from '../middleware/auth.middleware';
import { UserRole } from '../types/user.types';

const router = express.Router();

// Public route - anyone can join the waitlist
router.post('/', WaitlistController.joinWaitlist);

// Protected route - only admins can view the waitlist
router.get('/', authenticate, hasRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), WaitlistController.getWaitlist);

export default router;