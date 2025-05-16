import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CircleService } from '../services/circle.service';
import { TipModel } from '../models/Tip';
import { UserModel } from '../models/User';
import { TransactionStatus } from '../models/Transaction';
import { withMongoTransaction } from '../utils/mongoTransaction';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { logger } from '../utils/logger';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { Transaction, TransactionType } from '../models/Transaction';
import { responseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest } from '../types/user.types';
import { SOLANA } from '../config/env.config';

const SOLANA_RPC_URL = SOLANA?.RPC_URL || 'https://api.devnet.solana.com';
const USDC_MINT = SOLANA?.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Default to devnet USDC mint
const PLATFORM_FEE_PERCENT = 0; // Platform fee percentage

export class TipController {
  /**
   * Process a new tip
   * @param req - Express request object
   * @param res - Express response object
   */
  static async createTip(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, recipientUsername, message, senderAddress } = req.body;

      // Input validation
      if (!amount || !recipientUsername || !senderAddress) {
        return sendError({
          res,
          message: '🚫 Amount, recipient username, and sender address are required',
          statusCode: 400
        });
      }

      // Validate amount
      if (isNaN(amount) || amount < 1) {
        return sendError({
          res,
          message: '🚫 Amount must be at least 1 USDC',
          statusCode: 400
        });
      }

      // Find recipient
      const recipient = await UserModel.findOne({ username: recipientUsername });
      if (!recipient) {
        return sendError({
          res,
          message: '🤔 Recipient not found',
          statusCode: 404
        });
      }

      // Ensure recipient has a wallet address
      if (!recipient.depositWalletAddress) {
        return sendError({
          res,
          message: '❌ Recipient has not set up their wallet yet',
          statusCode: 400
        });
      }

      // Calculate fees
      const fee = CircleService.calculatePlatformFee(amount);
      const netAmount = parseFloat((amount - fee).toFixed(2));

      // Get client info
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      // Use transaction to ensure data consistency
      const result = await withMongoTransaction(async (session) => {
        // Create tip record
        const tip = new TipModel({
          recipientId: recipient._id,
          senderId: req.user?.userId, // Optional, only if tipper is logged in
          senderAddress,
          recipientAddress: recipient.depositWalletAddress,
          amount,
          fee,
          netAmount,
          currency: 'USDC',
          status: TransactionStatus.PENDING,
          message: message?.trim(),
          metadata: {
            ipAddress,
            userAgent,
            isAnonymous: !req.user
          }
        });

        // Save tip with session
        await tip.save({ session });

        // Process transfer through Circle
        const { transactionId, status } = await CircleService.processUSDCTransfer(
          senderAddress,
          recipient.depositWalletAddress,
          amount,
          uuidv4() // Unique idempotency key
        );

        // Update tip with Circle transaction ID
        tip.transactionId = transactionId;
        tip.status = status === 'complete' ? TransactionStatus.COMPLETED : TransactionStatus.PENDING;
        await tip.save({ session });

        return {
          tipId: tip._id,
          amount,
          fee,
          netAmount,
          status: tip.status,
          recipient: {
            username: recipient.username,
            displayName: recipient.displayName
          }
        };
      });

      // Return success response
      return sendSuccess({
        res,
        message: '✨ Tip processed successfully!',
        data: result,
        statusCode: 201
      });

    } catch (error: any) {
      logger.error(`❌ Error processing tip: ${error.message}`);
      return sendError({
        res,
        message: 'Failed to process tip. Please try again.',
        statusCode: 500,
        error
      });
    }
  }

  /**
   * Get tip status
   */
  static async getTipStatus(req: Request, res: Response) {
    try {
      const { tipId } = req.params;

      const tip = await TipModel.findById(tipId);
      if (!tip) {
        return sendError({
          res,
          message: '🤔 Tip not found',
          statusCode: 404
        });
      }

      // If tip is pending and has a Circle transaction ID, check status
      if (tip.status === TransactionStatus.PENDING && tip.transactionId) {
        const circleStatus = await CircleService.getTransferStatus(tip.transactionId);
        
        if (circleStatus === 'complete') {
          tip.status = TransactionStatus.COMPLETED;
          await tip.save();
        } else if (circleStatus === 'failed') {
          tip.status = TransactionStatus.FAILED;
          await tip.save();
        }
      }

      return sendSuccess({
        res,
        message: 'Tip status retrieved successfully',
        data: {
          status: tip.status,
          amount: tip.amount,
          netAmount: tip.netAmount,
          createdAt: tip.createdAt
        }
      });

    } catch (error: any) {
      logger.error(`❌ Error getting tip status: ${error.message}`);
      return sendError({
        res,
        message: 'Failed to get tip status',
        statusCode: 500,
        error
      });
    }
  }

  /**
   * Get tips for a user
   */
  static async getUserTips(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, limit = 10, page = 1 } = req.query;

      const query: any = { recipientId: userId };
      if (status) {
        query.status = status;
      }

      const tips = await TipModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('senderId', 'username displayName');

      const total = await TipModel.countDocuments(query);

      return sendSuccess({
        res,
        message: 'Tips retrieved successfully',
        data: {
          tips,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error: any) {
      logger.error(`❌ Error getting user tips: ${error.message}`);
      return sendError({
        res,
        message: 'Failed to get tips',
        statusCode: 500,
        error
      });
    }
  }

  /**
   * Submit a new tip from blockchain transaction
   */
  static async submitTip(req: Request, res: Response) {
    const { txSignature, amount, recipientUsername, message, tipperWallet, recipientWallet } = req.body;

    try {
      logger.info(`Processing tip submission with signature: ${txSignature}`);
      
      // Input validation
      if (!txSignature || !amount || !recipientUsername || !tipperWallet) {
        return responseHandler.badRequest(
          res, 
          'Missing required fields: txSignature, amount, recipientUsername, and tipperWallet are required'
        );
      }

      // 1. Find recipient user
      const recipient = await UserModel.findOne({ username: recipientUsername });
      if (!recipient) {
        return responseHandler.notFound(res, 'Recipient not found 😕');
      }

      // Log more details about the transaction to debug
      logger.info(`Verifying transaction for tip: ${amount} USDC from ${tipperWallet} to ${recipient.username}`);
      logger.info(`Using Solana RPC URL: ${SOLANA_RPC_URL}`);
      logger.info(`Using USDC Mint: ${USDC_MINT}`);

      // 2. Verify the transaction on Solana
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
      
      // First try with retry mechanism
      let tx = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!tx && retryCount < maxRetries) {
        try {
          logger.info(`Attempt ${retryCount + 1} to fetch transaction ${txSignature}`);
          tx = await connection.getTransaction(txSignature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (tx) {
            logger.info('Transaction fetched successfully');
            // Log transaction details for debugging
            logger.info(`Transaction status: ${tx.meta?.err ? 'Failed' : 'Success'}`);
            logger.info(`Transaction blockTime: ${tx.blockTime}`);
            logger.info(`Transaction slot: ${tx.slot}`);
            break;
          } else {
            logger.warn(`Transaction not found on attempt ${retryCount + 1}, waiting before retry...`);
            // Wait longer between retries - blockchain might need more time
            await new Promise(resolve => setTimeout(resolve, 3000));
            retryCount++;
          }
        } catch (error) {
          logger.error(`Error fetching transaction on attempt ${retryCount + 1}:`, error);
          retryCount++;
          // Wait longer between retries
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      if (!tx) {
        logger.error(`Transaction not found after ${maxRetries} attempts: ${txSignature}`);
        return responseHandler.notFound(res, 'Transaction not found on Solana blockchain after multiple attempts. It may still be processing, please try again in a moment. 🤔');
      }

      // Calculate platform fee
      const fee = (amount * PLATFORM_FEE_PERCENT) / 100;
      const netAmount = amount - fee;

      // Validate all required fields are present
      if (!txSignature || !amount || !recipient._id || !netAmount) {
        logger.error('Missing required fields:', { txSignature, amount, recipientId: recipient._id, fee, netAmount });
        return responseHandler.badRequest(res, 'Missing required transaction fields');
      }

      // Validate transaction was successful
      if (tx.meta?.err) {
        logger.error('Transaction failed on Solana:', tx.meta.err);
        return responseHandler.badRequest(res, 'Transaction failed on Solana blockchain');
      }

      // 5. Store the transaction
      const transaction = await Transaction.create({
        type: TransactionType.TIP,
        amount,
        currency: 'USDC',
        status: TransactionStatus.COMPLETED,
        message,
        recipient: recipient._id,
        tipperWallet,
        fee,
        netAmount,
        txSignature, // Required field
        blockExplorerUrl: `https://solscan.io/tx/${txSignature}${SOLANA_RPC_URL.includes('devnet') ? '?cluster=devnet' : ''}`,
        recipientWallet,
        metadata: {
          transactionType: 'tip',
          solana: {
            signature: txSignature,
            mint: USDC_MINT,
            network: SOLANA_RPC_URL.includes('devnet') ? 'devnet' : 'mainnet',
            slot: tx.slot,
            blockTime: tx.blockTime,
            confirmationStatus: 'confirmed'
          },
          clientInfo: {
            ipAddress: req.ip || req.socket.remoteAddress || '',
            userAgent: req.headers['user-agent'] || ''
          }
        }
      });

      logger.info(`✨ New tip received! Amount: ${amount} USDC, From: ${tipperWallet?.slice(0,8)}..., To: ${recipientUsername}`);

      return responseHandler.success(res, 'Tip processed successfully! 🎉', transaction);
    } catch (error: any) {
      logger.error('Error processing tip:', error);
      return responseHandler.serverError(res, `Failed to process tip: ${error.message} 😕`);
    }
  }

  /**
   * Get all tips for a user by username
   */
  static async getTips(req: Request, res: Response) {
    const { username } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    try {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return responseHandler.notFound(res, 'User not found 😕');
      }

      const tips = await Transaction.find({ 
        recipient: user._id,
        type: TransactionType.TIP,
        status: TransactionStatus.COMPLETED
      })
        .sort({ createdAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit));

      const total = await Transaction.countDocuments({ 
        recipient: user._id,
        type: TransactionType.TIP,
        status: TransactionStatus.COMPLETED
      });

      const responseData = {
        tips,
        total
      };

      return responseHandler.success(res, 'Tips retrieved successfully', responseData);

    } catch (error: any) {
      logger.error('Error fetching tips:', error);
      return responseHandler.serverError(res, 'Failed to fetch tips 😕');
    }
  }
}