import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, ValidationChain } from 'express-validator';
import { responseHandler } from '../utils/responseHandler';

/**
 * Validation middleware that checks for validation errors
 * and returns a proper error response if validation fails
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler.badRequest(res, 'Validation failed 😕', errors.array().map((error) => ({
      path: (error as any)?.path,
      message: error?.msg
    })));
  }
  next();
};

/**
 * Schema-based validation middleware
 * Use this for easy validation of request bodies, params, and queries
 * 
 * @example
 * validation({
 *   body: {
 *     email: { type: 'string', required: true },
 *     password: { type: 'string', required: true, minLength: 8 }
 *   }
 * })
 */
export const validation = (schema: {
  body?: Record<string, any>;
  params?: Record<string, any>;
  query?: Record<string, any>;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate body if schema.body is provided
    if (schema.body) {
      const bodyErrors = validateSchema(req.body, schema.body);
      if (bodyErrors.length) {
        return responseHandler.badRequest(res, 'Invalid request data 😕', bodyErrors);
      }
    }

    // Validate params if schema.params is provided
    if (schema.params) {
      const paramsErrors = validateSchema(req.params, schema.params);
      if (paramsErrors.length) {
        return responseHandler.badRequest(res, 'Invalid request parameters 😕', paramsErrors);
      }
    }

    // Validate query if schema.query is provided
    if (schema.query) {
      const queryErrors = validateSchema(req.query, schema.query);
      if (queryErrors.length) {
        return responseHandler.badRequest(res, 'Invalid query parameters 😕', queryErrors);
      }
    }

    // If all validations pass, continue
    next();
  };
};

/**
 * Helper function to validate data against a schema
 */
function validateSchema(data: any, schema: Record<string, any>): Array<{ path: string; message: string }> {
  const errors: Array<{ path: string; message: string }> = [];

  for (const [key, rules] of Object.entries(schema)) {
    // Check if field is required but missing or undefined
    if (rules.required && (data[key] === undefined || data[key] === null || data[key] === '')) {
      errors.push({
        path: key,
        message: `${key} is required`
      });
      continue;
    }

    // Skip further validation if field is optional and not provided
    if ((!rules.required || rules.optional) && (data[key] === undefined || data[key] === null)) {
      continue;
    }

    // Validate type
    if (rules.type && typeof data[key] !== rules.type) {
      errors.push({
        path: key,
        message: `${key} must be a ${rules.type}`
      });
    }

    // Validate minimum length
    if (rules.minLength !== undefined && data[key]?.length < rules.minLength) {
      errors.push({
        path: key,
        message: `${key} must be at least ${rules.minLength} characters`
      });
    }

    // Validate maximum length
    if (rules.maxLength !== undefined && data[key]?.length > rules.maxLength) {
      errors.push({
        path: key,
        message: `${key} must be at most ${rules.maxLength} characters`
      });
    }

    // Validate array
    if (rules.type === 'array' && !Array.isArray(data[key])) {
      errors.push({
        path: key,
        message: `${key} must be an array`
      });
    }

    // Validate array items if specified
    if (Array.isArray(data[key]) && rules.items) {
      data[key].forEach((item: any, index: number) => {
        // Check type of each item
        if (rules.items.type && typeof item !== rules.items.type) {
          errors.push({
            path: `${key}[${index}]`,
            message: `${key}[${index}] must be a ${rules.items.type}`
          });
        }
      });
    }

    // Validate email format
    if (rules.isEmail && data[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[key])) {
      errors.push({
        path: key,
        message: `${key} must be a valid email address`
      });
    }

    // Validate URL format
    if (rules.isUrl && data[key] && !/^https?:\/\/.*/.test(data[key])) {
      errors.push({
        path: key,
        message: `${key} must be a valid URL`
      });
    }
  }

  return errors;
}

/**
 * Validation chains for different routes
 * Using this with express-validator middleware
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