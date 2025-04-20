import rateLimit, {
  Options,
  RateLimitRequestHandler,
  RateLimitExceededEventHandler,
} from "express-rate-limit";
import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Default rate limiter options
 */
const defaultRateLimitOptions: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
};

/**
 * Custom handler for rate limit exceeded
 */
const rateLimitHandler: RateLimitExceededEventHandler = (
  request,
  response,
  next,
  options
) => {
  return response.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
  });
};

// Type assertion function to help Express recognize the middleware
const asMiddleware = (limiter: RateLimitRequestHandler): RequestHandler =>
  limiter as unknown as RequestHandler;

/**
 * Global rate limiter for all routes
 */
export const globalRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    ...defaultRateLimitOptions,
    handler: rateLimitHandler,
  })
);

/**
 * Auth route rate limiter (login, register, etc.)
 * More strict to prevent brute force attacks
 */
export const authRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
      success: false,
      message: "Too many authentication attempts, please try again later.",
    },
    handler: rateLimitHandler,
  })
);

/**
 * Password reset rate limiter
 * Very strict to prevent abuse
 */
export const passwordResetRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 requests per windowMs
    message: {
      success: false,
      message: "Too many password reset attempts, please try again later.",
    },
    handler: rateLimitHandler,
  })
);

/**
 * API rate limiter for general API endpoints
 */
export const apiRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    ...defaultRateLimitOptions,
    max: 150, // limit each IP to 150 requests per windowMs
    handler: rateLimitHandler,
  })
);

/**
 * Admin routes rate limiter
 */
export const adminRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // higher limit for admin operations
    message: {
      success: false,
      message: "Too many requests to admin endpoints, please try again later.",
    },
    handler: rateLimitHandler,
  })
);

/**
 * Very strict rate limiter for financial operations
 * Used for withdrawals and other sensitive financial endpoints
 */
export const financialOperationsRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 financial operations per hour
    message: {
      success: false,
      message: "Too many financial operations, please try again later.",
    },
    handler: rateLimitHandler,
  })
);

/**
 * User creation rate limiter
 * Prevents mass account creation
 */
export const userCreationRateLimiter: RequestHandler = asMiddleware(
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // limit each IP to 5 user creations per day
    message: {
      success: false,
      message: "Account creation limit reached, please try again later.",
    },
    handler: rateLimitHandler,
  })
);

/**
 * IP-based rate limiter generator
 * Can be used to create custom rate limiters
 */
export const createIpLimiter = (
  windowMs: number = 15 * 60 * 1000,
  max: number = 100,
  message: string = "Too many requests, please try again later."
): RequestHandler => {
  return asMiddleware(
    rateLimit({
      windowMs,
      max,
      message: {
        success: false,
        message,
      },
      handler: rateLimitHandler,
    })
  );
};
