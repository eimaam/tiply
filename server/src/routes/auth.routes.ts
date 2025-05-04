import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate, withAuth } from "../middleware/auth.middleware";
import { validations, validation, validateRequest } from "../middleware/validation.middleware";
import {
  authRateLimiter,
  userCreationRateLimiter,
  passwordResetRateLimiter,
} from "../middleware/rate-limit.middleware";

const router = Router();

/**
 * Authentication Routes
 */

// Register a new user - Apply user creation rate limiter to prevent mass account creation
router.post(
  "/register",
  userCreationRateLimiter,
  validation({
    body: {
      email: { type: "string", required: true },
      password: { type: "string", required: true, minLength: 8 },
    },
  }),
  AuthController.register
);

// Login a user - Apply auth rate limiter to prevent brute force attacks
router.post(
  "/login",
  authRateLimiter,
  validation({
    body: {
      email: { type: "string", required: true },
      password: { type: "string", required: true },
    },
  }),
  AuthController.login
);

// Refresh access token
router.post("/refresh", authRateLimiter, AuthController.refreshToken);

// Verify email
router.get("/verify-email/:token", AuthController.verifyEmail);

// Request password reset - Apply password reset rate limiter
router.post(
  "/forgot-password",
  passwordResetRateLimiter,
  validation({
    body: {
      email: { type: "string", required: true },
    },
  }),
  AuthController.requestPasswordReset
);

// Reset password - Apply password reset rate limiter
router.post(
  "/reset-password/:token",
  passwordResetRateLimiter,
  validation({
    body: {
      password: { type: "string", required: true, minLength: 8 },
    },
  }),
  AuthController.resetPassword
);

// Get current user (protected route)
router.get("/me", authenticate, withAuth(AuthController.getCurrentUser));

// Logout
router.post("/logout", authenticate, withAuth(AuthController.logout));

// Protected onboarding routes
router.post(
  "/onboarding/username",
  authenticate,
  withAuth(AuthController.saveUsername)
);
router.post(
  "/onboarding/profile",
  authenticate,
  withAuth(AuthController.saveProfile)
);
router.post(
  "/onboarding/avatar",
  authenticate,
  withAuth(AuthController.saveAvatar)
);
router.post(
  "/onboarding/customization",
  authenticate,
  withAuth(AuthController.saveCustomization)
);
router.post(
  "/onboarding/complete",
  authenticate,
  withAuth(AuthController.completeOnboarding)
);

// Username availability check (public)
router.get(
  "/check-username/:username",
  validations.usernameCheck,
  validateRequest,
  AuthController.checkUsername
);

export default router;
