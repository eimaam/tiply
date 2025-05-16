import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { UserModel } from '../models/User';
import { 
  sendSuccess, 
  sendError, 
  throwResponse, 
  handleControllerError 
} from '../utils/responseHandler';
import { withMongoTransaction } from '../utils/mongoTransaction';
import { AuthenticatedRequest } from '../types/user.types';
import { CircleService } from '../services/circle.service';
import { isSolanaWalletAddress } from '../utils/walletAddressValidator';
import { v4 as uuidv4 } from 'uuid';
import { SOLANA } from '../config/env.config';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';
import { responseHandler } from '../utils/responseHandler';
import { TransactionState } from '@circle-fin/developer-controlled-wallets';

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
  static async createWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      // User must be authenticated
      if (!req.user) {
        return responseHandler.unauthorized(res, 'Authentication required');
      }

      const { amount, withdrawalAddress } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      // Validate required fields
      if (!amount || !withdrawalAddress) {
        return responseHandler.badRequest(res, 'Amount and withdrawal address are required');
      }

      // Validate withdrawal address format
      if (!isSolanaWalletAddress(withdrawalAddress)) {
        return responseHandler.badRequest(res, 'Invalid Solana wallet address');
      }

      // Get user from database
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return responseHandler.notFound(res, 'User not found');
      }

      if (!user.circleWalletId) {
        return responseHandler.notFound(res, 'User wallet not found');
      }

      // Generate a temporary transaction signature
      const tempTxSignature = uuidv4();

      // Use transaction to ensure data consistency
      const result = await withMongoTransaction(async (session) => {
        // Create withdrawal transaction in pending state
        const withdrawalDoc = await Transaction.create([{
          type: TransactionType.WITHDRAWAL,
          amount,
          currency: 'USDC',
          status: TransactionStatus.PROCESSING,
          walletAddress: withdrawalAddress,
          description: 'Withdrawal to external wallet',
          ipAddress,
          userAgent,
          recipient: user._id,
          fee: 0, // No fee for withdrawals currently
          netAmount: amount,
          txSignature: tempTxSignature,
          blockExplorerUrl: `https://solscan.io/tx/${tempTxSignature}${SOLANA.RPC_URL.includes('devnet') ? '?cluster=devnet' : ''}`,
          metadata: {
            transactionType: 'withdrawal',
            solana: {
              network: SOLANA.RPC_URL.includes('devnet') ? 'devnet' : 'mainnet',
              mint: SOLANA.USDC_MINT
            },
            clientInfo: {
              ipAddress,
              userAgent
            }
          }
        }], { session });

        const withdrawal = withdrawalDoc[0];

        // Initiate withdrawal with Circle
        const circleWithdrawal = await CircleService.withdrawToExternalWallet(
          user.circleWalletId,
          withdrawalAddress,
          amount
        );

        // Update transaction with Circle details
        await Transaction.findByIdAndUpdate(
          withdrawal._id,
          {
            $set: {
              'metadata.circle': {
                transactionId: circleWithdrawal.transactionId,
                state: circleWithdrawal.status,
                destinationAddress: withdrawalAddress,
                amount: amount.toString()
              }
            }
          },
          { session }
        );
        return {...withdrawal, transactionId: withdrawal?._id}
      });
      logger.info(`💸 Withdrawal initiated! Amount: ${amount} USDC, To: ${withdrawalAddress.slice(0,8)}...`);

      // Return response with transaction IDs
      return responseHandler.success(res, 'Withdrawal initiated successfully! 🎉', {
        transactionId: result.transactionId,
        circleTransactionId: result.metadata?.circle?.transactionId,
        status: result.status,
        amount: result.amount,
        withdrawalAddress: result.walletAddress,
        createdAt: result.createdAt
      });
    } catch (error) {
      logger.error('Withdrawal error:', error);
      return responseHandler.serverError(res, 'An unexpected error occurred');
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
   * Get transaction status
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getTransactionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return responseHandler.badRequest(res, 'Transaction ID is required');
      }

      // Find transaction
      const transaction = await Transaction.findById(id);
      
      if (!transaction) {
        return responseHandler.notFound(res, 'Transaction not found');
      }

      return responseHandler.success(res, 'Transaction status retrieved successfully', {
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        metadata: transaction.metadata
      });

    } catch (error: any) {
      logger.error('Error getting transaction status:', error);
      return responseHandler.serverError(res, error.message);
    }
  }

  /**
   * Get withdrawal transaction status
   * @param req - Express request object
   * @param res - Express response object
   */
  static async getWithdrawalStatus(req: AuthenticatedRequest, res: Response) {
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

      // Find transaction by MongoDB ID
      const transaction = await Transaction.findById(transactionId) as any;

      if (!transaction) {
        return sendError({
          res,
          message: 'Transaction not found',
          statusCode: 404
        });
      }

      // Only the transaction owner can check status
      if (transaction.recipient.toString() !== req.user.userId && 
          !['admin', 'super_admin'].includes(req.user.role)) {
        return sendError({
          res,
          message: 'Access denied. You are not authorized to view this transaction',
          statusCode: 403,
          code: 'UNAUTHORIZED_ACCESS'
        });
      }

      // Verify it's a withdrawal transaction
      if (transaction.type !== TransactionType.WITHDRAWAL) {
        return sendError({
          res,
          message: 'This is not a withdrawal transaction',
          statusCode: 400,
          code: 'NOT_WITHDRAWAL_TRANSACTION'
        });
      }

      let circleStatus = null;
      let updatedStatus = transaction.status;

      // Check with Circle for latest status if we have a Circle transaction ID
      const circleTransactionId = transaction.metadata?.circle?.transactionId;
      if (circleTransactionId && 
          ![TransactionStatus.COMPLETED, TransactionStatus.FAILED, TransactionStatus.CANCELLED].includes(transaction.status)) {
        try {
          // Get status from Circle API
          const statusResult = await CircleService.getWithdrawalStatus(circleTransactionId);
          circleStatus = statusResult;
          
          // Update transaction status based on Circle status
          if (statusResult.state === "COMPLETE" && transaction.status !== TransactionStatus.COMPLETED) {
            transaction.status = TransactionStatus.COMPLETED;
            transaction.completedAt = new Date();
            transaction.txHash = statusResult.txHash;
            transaction.blockExplorerUrl = `https://solscan.io/tx/${statusResult.txHash}${SOLANA.RPC_URL.includes('devnet') ? '?cluster=devnet' : ''}`;
            transaction.metadata.circle.txHash = statusResult.txHash;
            transaction.metadata.circle.state = statusResult.state;
            transaction.metadata.circle.networkFee = statusResult.networkFee;
            await transaction.save();
            updatedStatus = TransactionStatus.COMPLETED;
          } else if (statusResult.state === TransactionState.Failed && transaction.status !== TransactionStatus.FAILED) {
            transaction.status = TransactionStatus.FAILED;
            if (!transaction.metadata) transaction.metadata = {};
            transaction.metadata.error = {
              message: statusResult.failureReason || 'Transaction failed on blockchain',
              timestamp: new Date()
            };
            await transaction.save();
            updatedStatus = TransactionStatus.FAILED;
          }
        } catch (error) {
          // Log error but don't fail the request
          console.error('Error fetching Circle transaction status:', error);
        }
      }

      // Return transaction status
      return sendSuccess({
        res,
        message: 'Withdrawal status retrieved successfully',
        data: {
          transactionId: transaction._id.toString(),
          circleTransactionId: circleTransactionId,
          status: updatedStatus,
          amount: transaction.amount,
          walletAddress: transaction.walletAddress,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
          circleDetails: circleStatus
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}