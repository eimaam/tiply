import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, UserStatus, OnboardingStep } from '../models/User';
import { Permission } from '../models/Permission';
import { 
  LoginRequest, 
  RegisterRequest, 
  JwtPayload, 
  AuthenticatedRequest, 
  UserRoleEnum
} from '../types/user.types';
import { v4 as uuidv4 } from 'uuid';
import { 
  sendSuccess, 
  sendError, 
  throwResponse, 
  handleControllerError,
  responseHandler, 
} from '../utils/responseHandler';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { JWT } from '../config/env.config';
import { withMongoTransaction } from '../utils/mongoTransaction';
import { defaultPermissionSets } from '../seeds/seed-data';
import { CircleService } from '../services/circle.service';
import { logger } from '../utils/logger';

export const ONBOARDING_STEP_SEQUENCE: OnboardingStep[] = [
  OnboardingStep.USERNAME,
  OnboardingStep.PROFILE,
  OnboardingStep.AVATAR,
  OnboardingStep.CUSTOMIZE,
  OnboardingStep.COMPLETE
];

const getNextOnboardingStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const currentIndex = ONBOARDING_STEP_SEQUENCE.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEP_SEQUENCE.length - 1) {
    return null; // No next step
  }
  return ONBOARDING_STEP_SEQUENCE[currentIndex + 1];
}

export class AuthController {
  /**
   * Register a new user with just email and password
   * @param req - Express request object
   * @param res - Express response object
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password }: RegisterRequest = req.body;

      // Check if user already exists with this email
      const existingUser = await UserService.getUserByEmail(email);

      if (existingUser) {
        return sendError({
          res, 
          message: 'Email is already in use',
          statusCode: 409
        });
      }

      // Use mongo transaction for creating user
      const result = await withMongoTransaction(async (session) => {
        // Set default role as BASIC_USER
        const defaultRole = UserRoleEnum.CREATOR;
        
        // Create the new user with minimal information, default role and permissions
        const userData = {
          email,
          password, // This will be hashed by the pre-save hook
          status: UserStatus.PENDING,
          role: defaultRole, // Assign default role
          permissions: defaultPermissionSets[defaultRole], // Assign permissions based on default role
          onboardingCompleted: false,
          currentOnboardingStep: OnboardingStep.USERNAME, // Use proper enum string value
          emailVerificationToken: uuidv4(),
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };

        // Save the user with session
        const user = await UserModel.create([userData], { session });
        if (!user || user.length === 0) {
          throwResponse('Failed to create user. Please try again later. 😕', 500, 'USER_CREATION_FAILED');
        }

        const newUser = user[0];

        // Generate access token with shorter lifespan
        const accessToken = TokenService.generateAccessToken(
          newUser._id.toString(),
          newUser.email,
          newUser.role,
          newUser.permissions
        );

        // Generate refresh token with longer lifespan
        const refreshToken = await TokenService.generateRefreshToken(
          newUser._id.toString(),
          newUser.email
        );
        

        // TODO: Send verification email to user

        return {
          accessToken,
          refreshToken,
          accessExpiresIn: TokenService.ACCESS_TOKEN_EXPIRY,
          refreshExpiresIn: TokenService.REFRESH_TOKEN_EXPIRY,
          user: {
            id: newUser._id,
            email: newUser.email,
            status: newUser.status,
            role: newUser.role,
            permissions: newUser.permissions,
            onboardingCompleted: newUser.onboardingCompleted,
            currentOnboardingStep: newUser.currentOnboardingStep,
            emailVerified: false,
          },
        };
      });

      // Set tokens in HttpOnly cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict'
      };
      
      // Access token cookie - shorter expiration
      res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000, // 30 minutes
      });
      
      // Refresh token cookie - longer expiration
      res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return success response without including the tokens in the response body
      return sendSuccess({
        res,
        message: 'User registered successfully! 🎉',
        data: {
          user: result.user,
          accessExpiresIn: result.accessExpiresIn,
          refreshExpiresIn: result.refreshExpiresIn
        },
        statusCode: 201
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Login a user
   * @param req - Express request object
   * @param res - Express response object
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Find the user
      const user = await UserModel.findOne({ email: {$regex: new RegExp(`^${email}$`, 'i')} })
      if (!user) {
        return sendError({
          res,
          message: 'Invalid email or password',
          statusCode: 401
        });
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING) {
        return sendError({
          res,
          message: 'Account is not active. Please contact support. 🔒',
          statusCode: 403,
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment failed login attempts
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        
        // Lock account if too many failed attempts (e.g., 5)
        if (user.failedLoginAttempts >= 5) {
          user.status = UserStatus.LOCKED;
          user.lockedAt = new Date();
        }
        
        await user.save();
        
        return sendError({
          res,
          message: 'Invalid email or password',
          statusCode: 401
        });
      }
      
      // Reset failed login attempts
      if (user.failedLoginAttempts > 0) {
        user.failedLoginAttempts = 0;
        await user.save();
      }

      // Generate access token with short lifespan
      const accessToken = TokenService.generateAccessToken(
        user._id.toString(),
        user.email,
        user.role,
        user.permissions
      );

      // Generate refresh token with longer lifespan
      const refreshToken = await TokenService.generateRefreshToken(
        user._id.toString(),
        user.email
      );

      // Update last login timestamp
      user.lastLogin = new Date();
      
      await user.save();

      // Prepare user data for response (exclude sensitive fields)
      const userData = {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        status: user.status,
        role: user.role,
        permissions: user.permissions,
        onboardingCompleted: user.onboardingCompleted,
        currentOnboardingStep: user.currentOnboardingStep,
        emailVerified: user.emailVerified,
        walletAddress: user.walletAddress,
        avatarUrl: user.avatarUrl,
        coverImageUrl: user.coverImageUrl,
        bio: user.bio,
      };

      // Set tokens in HttpOnly cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict'
      };
      
      // Access token cookie
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000, // 30 minutes
      });
      
      // Refresh token cookie - longer expiration
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Cleanup any expired refresh tokens
      await TokenService.cleanupExpiredTokens(user._id.toString());

      return sendSuccess({
        res,
        message: 'Login successful! 🎉',
        data: {
          accessExpiresIn: TokenService.ACCESS_TOKEN_EXPIRY,
          refreshExpiresIn: TokenService.REFRESH_TOKEN_EXPIRY,
          user: userData
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param req - Express request object
   * @param res - Express response object
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return sendError({
          res,
          message: 'Refresh token not provided',
          statusCode: 401
        });
      }
      
      // Verify refresh token and get new access token
      const result = await TokenService.verifyRefreshToken(refreshToken);
      
      if (!result) {
        // Clear the invalid refresh token cookie
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as 'strict',
          path: '/api/v1/auth/refresh'
        });
        
        return sendError({
          res,
          message: 'Invalid refresh token',
          statusCode: 401
        });
      }
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict'
      };
      
      // Set new access token in cookie
      res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000 // 30 minutes
      });
      
      // Set the new refresh token in cookie (token rotation)
      res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return sendSuccess({
        res,
        message: 'Token refreshed successfully! 🔄',
        data: {
          accessExpiresIn: TokenService.ACCESS_TOKEN_EXPIRY,
          refreshExpiresIn: TokenService.REFRESH_TOKEN_EXPIRY
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Save username during onboarding
   * @param req - Express request object
   * @param res - Express response object
   */
  static async saveUsername(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.user;
      const { username } = req.body;

      // Check if username is already taken
      const existingUser = await UserModel.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return sendError({
          res,
          message: 'Username is already taken',
          statusCode: 409
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      // Update user with username
      user.username = username;
      
      // get the next step in the onboarding process after username a
      const currentStepIndex = ONBOARDING_STEP_SEQUENCE.indexOf(user.currentOnboardingStep);
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = ONBOARDING_STEP_SEQUENCE[nextStepIndex];
      if (nextStep) {
        user.currentOnboardingStep = nextStep;
      } else {
        user.currentOnboardingStep = OnboardingStep.COMPLETE;
      }

      // Save the user with the new username and onboarding step
      await user.save();

      return sendSuccess({
        res,
        message: 'Username saved successfully',
        data: {
          currentOnboardingStep: user.currentOnboardingStep,
          username: user.username
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Save profile info during onboarding
   * @param req - Express request object
   * @param res - Express response object
   */
  static async saveProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const { displayName, bio, socialLinks } = req.body;

      if (!displayName || displayName.trim().length < 2) {
        return sendError({
          res,
          message: 'Display name is required and must be at least 2 characters',
          statusCode: 400
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      user.displayName = displayName.trim();
      user.bio = bio || user.bio;
      user.socialLinks = socialLinks || user.socialLinks;
      // Update to set the next step (AVATAR) instead of the current step (PROFILE)
      user.currentOnboardingStep = OnboardingStep.AVATAR;
      await user.save();

      return sendSuccess({
        res,
        message: 'Profile updated successfully 🙌',
        data: {
          currentOnboardingStep: user.currentOnboardingStep,
          displayName: user.displayName,
          bio: user.bio,
          socialLinks: user.socialLinks
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Save avatar and cover image during onboarding
   * @param req - Express request object
   * @param res - Express response object
   */
  static async saveAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const { avatarUrl, coverImageUrl } = req.body;

      // Avatar is now optional, so we don't require it
      // if (!avatarUrl) {
      //   return sendError({
      //     res,
      //     message: 'Avatar URL is required',
      //     statusCode: 400
      //   });
      // }

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      const updateData: any = {
        // Only update these fields if they are provided
        ...(avatarUrl && { avatarUrl }),
        ...(coverImageUrl && { coverImageUrl }),
        // Always update the onboarding step to the next step
        currentOnboardingStep: OnboardingStep.CUSTOMIZE
      };

      // Update user with avatar and/or cover image URL
      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

      if (!updatedUser) {
        return sendError({
          res,
          message: 'Failed to update profile images',
          statusCode: 500
        });
      }

      return sendSuccess({
        res,
        message: 'Profile images updated successfully 🖼️',
        data: {
          currentOnboardingStep: updatedUser.currentOnboardingStep,
          avatarUrl: updatedUser.avatarUrl,
          coverImageUrl: updatedUser.coverImageUrl
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Save customization settings during onboarding
   * @param req - Express request object
   * @param res - Express response object
   */
  static async saveCustomization(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;
      const { 
        primaryColor,
        backgroundColor,
        fontFamily,
        buttonStyle,
        customCss,
        showTipCounter,
        enableCustomMessage,
        tipOptions,
        minimumTipAmount,
        allowCustomAmounts,
        receiveNotes
      } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      // Initialize customization object if it doesn't exist
      if (!user.customization) {
        user.customization = {};
      }

      // Update user customization settings with provided values
      if (primaryColor !== undefined) user.customization.primaryColor = primaryColor;
      if (backgroundColor !== undefined) user.customization.backgroundColor = backgroundColor;
      if (fontFamily !== undefined) user.customization.fontFamily = fontFamily;
      if (buttonStyle !== undefined) user.customization.buttonStyle = buttonStyle;
      if (customCss !== undefined) user.customization.customCss = customCss;
      if (showTipCounter !== undefined) user.customization.showTipCounter = showTipCounter;
      if (enableCustomMessage !== undefined) user.customization.enableCustomMessage = enableCustomMessage;
      if (tipOptions !== undefined) user.customization.tipOptions = tipOptions;
      if (minimumTipAmount !== undefined) user.customization.minimumTipAmount = minimumTipAmount;
      if (allowCustomAmounts !== undefined) user.customization.allowCustomAmounts = allowCustomAmounts;
      if (receiveNotes !== undefined) user.customization.receiveNotes = receiveNotes;
      
      // Update onboarding step
      user.currentOnboardingStep = OnboardingStep.COMPLETE;
      await user.save();

      return sendSuccess({
        res,
        message: 'Customization settings saved successfully! 🎨',
        data: {
          currentOnboardingStep: user.currentOnboardingStep,
          customization: user.customization
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Complete onboarding process
   * @param req - Express request object
   * @param res - Express response object
   */
  static async completeOnboarding(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      // Check if all required fields are present
      if (!user.username) {
        return sendError({
          res,
          message: 'Cannot complete onboarding: missing required information',
          statusCode: 400,
          error: [
            !user.username ? 'Username is required' : null,
          ].filter(Boolean)
        });
      }

      // Mark onboarding as completed and activate account
      user.onboardingCompleted = true;
      user.status = UserStatus.ACTIVE;
      
      // Update role to CREATOR if user has completed onboarding
      user.role = UserRoleEnum.CREATOR;
      
      // Update permissions based on the new role
      const creatorPermissions = defaultPermissionSets[UserRoleEnum.CREATOR];
      if (creatorPermissions) {
        user.permissions = creatorPermissions;
      }

      // create wallet
      const wallet = await CircleService.createWallet(user?._id);

      if (!wallet) {
        throwResponse('Failed to create wallet. Please try again later. 😕', 500, 'WALLET_CREATION_FAILED');
      }

      const walletData = {
        circleWalletId: (wallet as any)?.id,
        depositWalletAddress: (wallet as any)?.address,  // Use depositWalletAddress here
      }

      // update user with wallet ID
      const walletUpdate = await UserModel.findByIdAndUpdate(user?._id, walletData);

      if (!walletUpdate) {
        throwResponse('Failed to update user with wallet ID. Please try again later. 😕', 500, 'USER_UPDATE_FAILED');
      }
      
      await user.save();

      return sendSuccess({
        res,
        message: 'Onboarding completed successfully! 🎉',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          status: user.status,
          role: user.role,
          permissions: user.permissions,
          onboardingCompleted: user.onboardingCompleted,
          emailVerified: user.emailVerified,
          depositWalletAddress: user.depositWalletAddress, // Changed from walletAddress
          withdrawalWalletAddress: user.withdrawalWalletAddress,
          avatarUrl: user.avatarUrl,
          coverImageUrl: user.coverImageUrl,
          bio: user.bio
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Check if a username is available
   * @param req - Express request object
   * @param res - Express response object
   */
  static async checkUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const existingUser = await UserService.getUserByUsername(username);

      return responseHandler.success(res, 
        existingUser ? "Username is already taken" : "Username is available", 
        {
        available: !existingUser,
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Verify email with token
   * @param req - Express request object
   * @param res - Express response object
   */
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      
      const user = await UserModel.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });
      
      if (!user) {
        return sendError({
          res,
          message: 'Email verification token is invalid or has expired',
          statusCode: 400
        });
      }
      
      // Mark email as verified
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      return sendSuccess({
        res,
        message: 'Email verified successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Request password reset
   * @param req - Express request object
   * @param res - Express response object
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      const user = await UserModel.findOne({ email });
      if (!user) {
        // Don't reveal that the user doesn't exist
        return sendSuccess({
          res,
          message: 'If the email is registered, a password reset link has been sent'
        });
      }
      
      // Generate reset token
      const resetToken = uuidv4();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();
      
      // TODO: Send password reset email
      
      return sendSuccess({
        res,
        message: 'If the email is registered, a password reset link has been sent'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Reset password with token
   * @param req - Express request object
   * @param res - Express response object
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });
      
      if (!user) {
        return sendError({
          res,
          message: 'Password reset token is invalid or has expired',
          statusCode: 400
        });
      }
      
      // Update password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      // If account was locked, unlock it
      if (user.status === UserStatus.LOCKED) {
        user.status = UserStatus.ACTIVE;
        user.failedLoginAttempts = 0;
        user.lockedAt = undefined;
      }
      
      await user.save();
      
      return sendSuccess({
        res,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Get current authenticated user
   * @param req - Express request object with user info from auth middleware
   * @param res - Express response object
   */
  static async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      // The user property is guaranteed to exist in AuthenticatedRequest
      const { userId } = req.user;

      // Find user by ID
      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found 🔍',
          statusCode: 404
        });
      }

      // Fetch balance from Circle if circleWalletId exists
      let balance = 0;
      if (user.circleWalletId) {
        try {
          balance = await CircleService.getWalletUSDCBalance(user.circleWalletId);
        } catch (balanceError: any) {
          logger.error(`⚠️ Failed to fetch balance for user ${userId} (${user.circleWalletId}): ${balanceError.message}`);
          // Continue without balance, default is 0
        }
      } else {
        logger.warn(`🤔 User ${userId} does not have a circleWalletId. Balance check skipped.`);
      }

      // Return user data with role and permissions
      return sendSuccess({
        res,
        message: 'User data retrieved successfully ✅',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            coverImageUrl: user.coverImageUrl,
            bio: user.bio,
            depositWalletAddress: user.depositWalletAddress, // Changed from walletAddress
            withdrawalWalletAddress: user.withdrawalWalletAddress,
            circleWalletId: user.circleWalletId,
            status: user.status,
            role: user.role,
            permissions: user.permissions,
            socialLinks: user.socialLinks,
            customization: user.customization,
            onboardingCompleted: user.onboardingCompleted,
            currentOnboardingStep: user.currentOnboardingStep,
            emailVerified: user.emailVerified,
            isVerified: user.isVerified,
            isFeatured: user.isFeatured,
            balance: balance,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Request Password Reset
   * @param req - Express request object
   * @param res - Express response object
   */
  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await UserService.getUserByEmail(email);

        if (!user) {
            return sendError({
            res,
            message: 'User with this email does not exist',
            statusCode: 404
            });
        }

        // Generate reset token
        const passwordResetToken = await TokenService.generatePasswordResetToken(
            user._id,
            JWT.SECRET,
            JWT.EXPIRY
        );
        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        return sendSuccess({
            res,
            message: 'Password reset token generated successfully',
            data: {
                token: passwordResetToken,
                expiresIn: user.passwordResetExpires
            }
        });

    } catch (error:any) {
        return sendError({
            res,
            message: error.message || 'An error occurred while generating password reset token',
            statusCode: 500
        })
    }



  }

  /**
   * Log out a user by clearing the auth cookies and revoking the refresh token
   * @param req - Express request object
   * @param res - Express response object
   */
  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      // If we have a refresh token and user ID, revoke the refresh token
      if (refreshToken && req.user?.userId) {
        await TokenService.revokeRefreshToken(req.user.userId, refreshToken);
      }
      
      // Clear both tokens
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict'
      });
      
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict',
        path: '/api/v1/auth/refresh'
      });
      
      return sendSuccess({
        res,
        message: 'Logged out successfully! 👋'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Get onboarding status for the current user
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getOnboardingStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.user;
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }
      
      return sendSuccess({
        res,
        message: 'Onboarding status retrieved successfully',
        data: {
          onboardingCompleted: user.onboardingCompleted,
          currentOnboardingStep: user.currentOnboardingStep,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          coverImageUrl: user.coverImageUrl,
          customization: user.customization ? true : false,
          hasData: {
            username: !!user.username,
            displayName: !!user.displayName,
            bio: !!user.bio,
            avatarUrl: !!user.avatarUrl,
            coverImageUrl: !!user.coverImageUrl
          }
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}