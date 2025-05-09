import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { User } from '../models/User';
import { 
  sendSuccess, 
  sendError, 
  throwResponse, 
  handleControllerError 
} from '../utils/responseHandler';
import { withMongoTransaction } from '../utils/mongoTransaction';
import { AuthenticatedRequest } from '../types/user.types';

/**
 * Transaction Controller Class
 */
export class TransactionController {
  /**
   * Get transactions for authenticated user
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getUserTransactions(req: Request, res: Response) {
    try {
      // User must be authenticated
      if (!req.user) {
        return sendError({
          res,
          message: 'Authentication required',
          statusCode: 401
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Build query object
      const query: any = { userId: req.user.userId };

      // Add filters if provided
      if (type) query.type = type;
      if (status) query.status = status;
      
      // Add date range filter if provided
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Count total documents
      const total = await Transaction.countDocuments(query);

      // Calculate pagination values
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      // Get transactions with pagination
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Return paginated transactions
      return sendSuccess({
        res,
        message: 'Transactions retrieved successfully',
        data: {
          transactions,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Create a withdrawal request
   * This is a sensitive financial operation with stringent security checks
   * @param req - Express request object
   * @param res - Express response object
   */
  static async createWithdrawal(req: Request, res: Response) {
    try {
      // User must be authenticated
      if (!req.user) {
        return sendError({
          res,
          message: 'Authentication required',
          statusCode: 401
        });
      }

      const { amount, walletAddress } = req.body;

      // Validate required fields
      if (!amount || !walletAddress) {
        return sendError({
          res,
          message: 'Amount and wallet address are required',
          statusCode: 400
        });
      }

      // Validate amount is a positive number
      if (isNaN(amount) || amount <= 0) {
        return sendError({
          res,
          message: 'Amount must be a positive number',
          statusCode: 400
        });
      }

      // Get user
      const user = await User.findById(req.user.userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found',
          statusCode: 404
        });
      }

      // Validate wallet address format (basic check, should be replaced with proper blockchain-specific validation)
      const solanaWalletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solanaWalletRegex.test(walletAddress)) {
        return sendError({
          res,
          message: 'Invalid wallet address format',
          statusCode: 400,
          code: 'INVALID_WALLET_ADDRESS'
        });
      }

      // Check if the wallet address matches the user's stored wallet address for extra security
      if (user.walletAddress && user.walletAddress !== walletAddress) {
        return sendError({
          res,
          message: 'Withdrawal wallet address does not match your account wallet address',
          statusCode: 403,
          code: 'WALLET_MISMATCH'
        });
      }

      // TODO: Check user balance (implement once balance tracking is added)
      
      // Get client IP and user agent for security tracking
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      // Use transaction to ensure data consistency
      const result = await withMongoTransaction(async (session) => {
        // Create withdrawal transaction
        const withdrawal = new Transaction({
          userId: req.user.userId,
          type: TransactionType.WITHDRAWAL,
          amount,
          currency: 'USDC', // Default currency for now
          status: TransactionStatus.PENDING,
          walletAddress,
          description: 'Withdrawal to wallet',
          ipAddress,
          userAgent,
          metadata: {
            requestedAt: new Date(),
            clientInfo: {
              ip: ipAddress,
              userAgent: userAgent,
            },
          },
        });

        // Save with transaction session
        await withdrawal.save({ session });

        // TODO: Update user balance in the same transaction
        // In a real implementation, you would also update the user's balance atomically
        
        // TODO: If this were a real system, also create a balance history record
        // const balanceHistory = new BalanceHistory({
        //   userId: req.user.userId,
        //   transactionId: withdrawal._id,
        //   amount: -amount,
        //   balanceBefore: user.balance,
        //   balanceAfter: user.balance - amount,
        //   type: 'WITHDRAWAL',
        // });
        // await balanceHistory.save({ session });

        return {
          transactionId: withdrawal._id,
          amount,
          walletAddress,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
        };
      });

      // Return success response
      return sendSuccess({
        res,
        message: 'Withdrawal request created successfully',
        data: result,
        statusCode: 201
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Get transaction by ID
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTransactionById(req: Request, res: Response) {
    try {
      // User must be authenticated
      if (!req.user) {
        return sendError({
          res,
          message: 'Authentication required',
          statusCode: 401
        });
      }

      const { transactionId } = req.params;

      // Validate transaction ID
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return sendError({
          res,
          message: 'Invalid transaction ID',
          statusCode: 400,
          code: 'INVALID_ID_FORMAT'
        });
      }

      // Find transaction
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return sendError({
          res,
          message: 'Transaction not found',
          statusCode: 404
        });
      }

      // Check if user is authorized to view this transaction
      if (transaction.userId.toString() !== req.user.userId && 
          !['admin', 'super_admin'].includes(req.user.role)) {
        return sendError({
          res,
          message: 'Access denied. You are not authorized to view this transaction',
          statusCode: 403,
          code: 'UNAUTHORIZED_ACCESS'
        });
      }

      // Return transaction
      return sendSuccess({
        res,
        message: 'Transaction retrieved successfully',
        data: {
          transaction,
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Get all transactions (admin only)
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getAllTransactions(req: Request, res: Response) {
    try {
      // User must be authenticated and admin
      if (!req.user || !req.user.roles.some(role => ['admin', 'super_admin'].includes(role))) {
        return sendError({
          res,
          message: 'Access denied. Admin privileges required',
          statusCode: 403,
          code: 'ADMIN_REQUIRED'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Build query object
      const query: any = {};

      // Add filters if provided
      if (userId && mongoose.Types.ObjectId.isValid(userId)) query.userId = userId;
      if (type) query.type = type;
      if (status) query.status = status;
      
      // Add date range filter if provided
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Count total documents
      const total = await Transaction.countDocuments(query);

      // Calculate pagination values
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      // Get transactions with pagination
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email displayName');

      // Return paginated transactions
      return sendSuccess({
        res,
        message: 'All transactions retrieved successfully',
        data: {
          transactions,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Update transaction status (admin only)
   * @param req - Express request object
   * @param res - Express response object
   */
  static async updateTransactionStatus(req: AuthenticatedRequest, res: Response) {
    try {
      // User must be authenticated and admin
      if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
        return sendError({
          res,
          message: 'Access denied. Admin privileges required',
          statusCode: 403,
          code: 'ADMIN_REQUIRED'
        });
      }

      const { transactionId } = req.params;
      const { status, txHash } = req.body;

      // Validate transaction ID
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return sendError({
          res,
          message: 'Invalid transaction ID',
          statusCode: 400,
          code: 'INVALID_ID_FORMAT'
        });
      }

      // Validate status
      if (!status || !Object.values(TransactionStatus).includes(status as TransactionStatus)) {
        return sendError({
          res,
          message: 'Invalid status value',
          statusCode: 400,
          code: 'INVALID_STATUS'
        });
      }

      // Use transaction to ensure data consistency
      const result = await withMongoTransaction(async (session) => {
        // Find transaction
        const transaction = await Transaction.findById(transactionId).session(session);

        if (!transaction) {
          throwResponse('Transaction not found', 404);
          return;
        }

        // Update transaction status
        transaction.status = status as TransactionStatus;
        
        // Add transaction hash if provided (for completed withdrawals/deposits)
        if (txHash) {
          transaction.txHash = txHash;
        }
        
        // If status is completed, set completedAt
        if (status === TransactionStatus.COMPLETED && !transaction.completedAt) {
          transaction.completedAt = new Date();
          
          // TODO: If this is a deposit, update user balance atomically in the same transaction
          // if (transaction.type === TransactionType.DEPOSIT) {
          //   await User.updateOne(
          //     { _id: transaction.userId },
          //     { $inc: { balance: transaction.amount } },
          //     { session }
          //   );
          // }
        }

        // Add admin info to metadata
        if (!transaction.metadata) transaction.metadata = {};
        transaction.metadata.lastUpdatedBy = {
          userId: req.user.userId,
          timestamp: new Date(),
        };

        await transaction.save({ session });

        return transaction;
      });

      // Return updated transaction
      return sendSuccess({
        res,
        message: 'Transaction status updated successfully',
        data: {
          transaction: result,
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
  
  /**
   * Process a tip transaction
   * @param req - Express request object
   * @param res - Express response object
   */
  static async processTip(req: Request, res: Response) {
    try {
      const { amount, recipientUsername, message, senderWallet } = req.body;
      
      // Validate required fields
      if (!amount || !recipientUsername || !senderWallet) {
        return sendError({
          res,
          message: 'Amount, recipient username, and sender wallet are required',
          statusCode: 400
        });
      }
      
      // Validate amount is a positive number
      if (isNaN(amount) || amount <= 0) {
        return sendError({
          res,
          message: 'Amount must be a positive number',
          statusCode: 400
        });
      }
      
      // Validate wallet address format
      const solanaWalletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solanaWalletRegex.test(senderWallet)) {
        return sendError({
          res,
          message: 'Invalid wallet address format',
          statusCode: 400,
          code: 'INVALID_WALLET_ADDRESS'
        });
      }
      
      // Find recipient by username
      const recipient = await User.findOne({ username: recipientUsername });
      if (!recipient) {
        return sendError({
          res,
          message: 'Recipient not found',
          statusCode: 404
        });
      }
      
      // Get client IP and user agent for security tracking
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';
      
      // Use transaction to ensure data consistency
      const result = await withMongoTransaction(async (session) => {
        // Create tip transaction
        const tip = new Transaction({
          userId: recipient._id, // The recipient of the tip
          type: TransactionType.TIP,
          amount,
          currency: 'USDC', // Default currency for now
          status: TransactionStatus.PENDING,
          walletAddress: senderWallet, // Sender's wallet
          recipientWallet: recipient.walletAddress, // Recipient's wallet
          description: message || 'Tip from anonymous',
          ipAddress,
          userAgent,
          metadata: {
            requestedAt: new Date(),
            clientInfo: {
              ip: ipAddress,
              userAgent: userAgent,
            },
            message,
            isAnonymous: !req.user,
            senderUserId: req.user?.userId || null,
          },
        });
        
        await tip.save({ session });
        
        // TODO: Update recipient's balance atomically
        // await User.updateOne(
        //   { _id: recipient._id },
        //   { $inc: { balance: amount } },
        //   { session }
        // );
        
        return {
          transactionId: tip._id,
          amount,
          recipient: {
            username: recipient.username,
            displayName: recipient.displayName,
          },
          status: tip.status,
          createdAt: tip.createdAt,
        };
      });
      
      // Return success response
      return sendSuccess({
        res,
        message: 'Tip processed successfully',
        data: result,
        statusCode: 201
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  /**
   * Get transaction status by ID (public endpoint for tip page)
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTransactionStatus(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;

      // Validate transaction ID
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return sendError({
          res,
          message: 'Invalid transaction ID format',
          statusCode: 400,
          code: 'INVALID_ID_FORMAT'
        });
      }

      // Find transaction
      const transaction = await Transaction.findById(transactionId).select('status amount txHash createdAt completedAt');

      if (!transaction) {
        return sendError({
          res,
          message: 'Transaction not found',
          statusCode: 404
        });
      }

      // Return transaction status
      return sendSuccess({
        res,
        message: 'Transaction status retrieved successfully',
        data: {
          transaction: {
            id: transaction._id,
            status: transaction.status,
            amount: transaction.amount,
            txHash: transaction.txHash,
            createdAt: transaction.createdAt,
            completedAt: transaction.completedAt
          }
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}