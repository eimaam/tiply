import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, ValidationChain } from 'express-validator';
import { sendError } from '../utils/responseHandler';

/**
 * Validation middleware that checks for validation errors
 * and returns a proper error response if validation fails
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError({
      res,
      message: 'Validation failed',
      error: errors.array().map((error) => ({
        path: (error as any)?.path,
        message: error?.msg
      })),
      statusCode: 400
    });
  }
  next();
};

/**
 * Validation chains for different routes
 */
export const validations = {
  // Auth validations
  register: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
  ],

  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Onboarding validations
  saveUsername: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores and hyphens')
  ],

  saveWallet: [
    body('walletAddress')
      .notEmpty()
      .withMessage('Wallet address is required')
      .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
      .withMessage('Please provide a valid Solana wallet address')
  ],

  saveProfile: [
    body('displayName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Display name must be between 2 and 50 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters')
  ],

  saveAvatar: [
    body('avatarUrl')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
    body('coverImageUrl')
      .optional()
      .isURL()
      .withMessage('Cover image URL must be a valid URL')
  ],

  saveCustomization: [
    body('tipAmounts')
      .optional()
      .isArray()
      .withMessage('Tip amounts must be an array'),
    body('tipAmounts.*')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Each tip amount must be a positive number'),
    body('theme')
      .optional()
      .isString()
      .withMessage('Theme must be a string value')
  ],

  // Password validations
  forgotPassword: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],

  resetPassword: [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
  ],

  // Token validation
  token: [
    param('token')
      .notEmpty()
      .withMessage('Token is required')
      .isLength({ min: 6 })
      .withMessage('Invalid token format')
  ]
};