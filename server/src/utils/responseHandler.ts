import { Response, Request } from "express";
import { logger } from "./logger";

/**
 * Standard success response format
 */
export interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
  meta?: {
    [key: string]: any;
  };
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
  code?: string;
}

/**
 * Success response options
 */
export interface SuccessOptions {
  res: Response;
  message: string;
  data?: any;
  statusCode?: number;
  meta?: { [key: string]: any };
}

/**
 * Error response options
 */
export interface ErrorOptions {
  res: Response;
  message: string;
  statusCode?: number;
  error?: any;
  code?: string;
}

/**
 * Throwable error interface
 */
export interface ThrowableError {
  message: string;
  statusCode: number;
  code?: string;
  error?: any;
}

/**
 * Send a standardized success response
 *
 * @param options Success response options object
 */
export const sendSuccess = (options: SuccessOptions): void => {
  const { res, message, data, statusCode = 200, meta } = options;

  const response: SuccessResponse = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  // Log successful operations (optional, for debugging)
  if (process.env.NODE_ENV !== "production") {
    logger.debug(`[SUCCESS] ${message}`);
  }

  res.status(statusCode).json(response);
};

/**
 * Send a standardized error response
 *
 * @param options Error response options object
 */
export const sendError = (options: ErrorOptions): void => {
  const { res, message, statusCode = 500, error, code } = options;

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (error) {
    response.error =
      process.env.NODE_ENV === "production"
        ? undefined
        : error instanceof Error
        ? error.message
        : error;
  }

  if (code) {
    response.code = code;
  }

  // Log errors
  logger.error(`[ERROR] ${message}`, error);

  res.status(statusCode).json(response);
};

/**
 * Creates a throwable error with standardized format.
 * Use this for early returns in controller logic.
 *
 * @param message Error message
 * @param statusCode HTTP status code
 * @param code Optional error code for clients
 * @param error Optional error object with details
 * @throws ThrowableError
 */
export const throwResponse = (
  message: string,
  statusCode: number = 500,
  code?: string,
  error?: any
): never => {
  const throwableError: ThrowableError = {
    message,
    statusCode,
    code,
    error: process.env.NODE_ENV === "production" ? undefined : error,
  };

  // Log the error
  logger.error(`[THROWN ERROR] ${message}`, error);

  throw throwableError;
};

/**
 * Handles errors from controllers in a standardized way
 *
 * @param error The caught error
 * @param res Express Response object
 */
export const handleControllerError = (error: any, res: Response): void => {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    "message" in error
  ) {
    // This is our throwable error format
    sendError({
      res,
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
      code: error.code,
    });
  } else {
    // Unexpected error
    sendError({
      res,
      message: "An unexpected error occurred",
      error,
    });
  }
};

/**
 * Response handler for different HTTP status codes
 *
 * @param res Express Response object
 * @param message Message to send in the response
 * @param data Optional data to send in the response
 * @param statusCode HTTP status code (default: 200)
 */
export const responseHandler = {
  /**
   * Sends a 400 Bad Request response
   *
   * @param res Express Response object
   * @param message Message to send in the response
   * @param data Optional data to send in the response
   */
  badRequest: (res: Response, message: string) => {
    sendError({
      res,
      message,
      statusCode: 400,
    });
  },
  /**
   * Sends a 401 Unauthorized response
   *
   */
  unauthorized: (res: Response, message: string) => {
    sendError({
      res,
      message,
      statusCode: 401,
    });
  },
  /**
   * Sends a 403 Forbidden response
   *
   */
  forbidden: (res: Response, message: string) => {
    sendError({
      res,
      message,
      statusCode: 403,
    });
  },
  /**
   * Sends a 404 Not Found response
   *
   */
  notFound: (res: Response, message: string) => {
    sendError({
      res,
      message,
      statusCode: 404,
    });
  },
  /**
   * Sends a 409 Conflict response
   *
   */
  conflict: (res: Response, message: string) => {
    sendError({
      res,
      message,
      statusCode: 409,
    });
  },
  /**
   * Sends a 500 Internal Server Error response
   *
   */
  serverError: (res: Response, message: string) => {
    sendError({
      res,
      message,
      statusCode: 500,
    });
  },
  /**
   * Sends a 201 Created response
   *
   */
  created: (res: Response, message: string, data?: any) => {
    sendSuccess({
      res,
      message,
      data,
      statusCode: 201,
    });
  },
  /**
   * Sends a 200 OK response
   *
   */
  success: (res: Response, message: string, data?: any) => {
    sendSuccess({
      res,
      message,
      data,
    });
  },
  /**
   * Sends a 204 No Content response
   *
   */
  noContent: (res: Response, message: string) => {
    sendSuccess({
      res,
      message,
      statusCode: 204,
    });
  },
  /**
   * Sends a 304 Not Modified response
   *
   */
  notModified: (res: Response, message: string) => {
    sendSuccess({
      res,
      message,
      statusCode: 304,
    });
  },
};
