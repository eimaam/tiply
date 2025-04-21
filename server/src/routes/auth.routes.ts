import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth.middleware';
import { 
  authRateLimiter, 
  userCreationRateLimiter, 
  passwordResetRateLimiter 
} from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * Authentication Routes
 */

// Register a new user - Apply user creation rate limiter to prevent mass account creation
router.post('/register', userCreationRateLimiter, AuthController.register);

// Login a user - Apply auth rate limiter to prevent brute force attacks
router.post('/login', authRateLimiter, AuthController.login);

// Verify email
router.get('/verify-email/:token', AuthController.verifyEmail);

// Request password reset - Apply password reset rate limiter
router.post('/forgot-password', passwordResetRateLimiter, AuthController.requestPasswordReset);

// Reset password - Apply password reset rate limiter
router.post('/reset-password/:token', passwordResetRateLimiter, AuthController.resetPassword);

// Get current user (protected route)
router.get('/me', authenticate, AuthController.getCurrentUser);

// Logout
router.post('/logout', authenticate, AuthController.logout);

export default router;