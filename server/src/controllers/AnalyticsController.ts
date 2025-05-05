import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/user.types';
import { UserModel } from '../models/User';
import { Transaction } from '../models/Transaction';
import { 
  sendSuccess, 
  sendError, 
  handleControllerError
} from '../utils/responseHandler';
import { CircleService } from '../services/circle.service';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class AnalyticsController {
  /**
   * Get dashboard analytics for the current user
   * @param req - Express request object with user info from auth middleware
   * @param res - Express response object
   */
  static async getDashboardAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.user;
      const { startDate, endDate } = req.query;

      // Set default date range if not provided (last 30 days)
      const endDateTime = endDate ? new Date(endDate as string) : new Date();
      const startDateTime = startDate 
        ? new Date(startDate as string) 
        : new Date(endDateTime.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Find user
      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError({
          res,
          message: 'User not found 🔍',
          statusCode: 404
        });
      }
      
      // Get balance from Circle if circleWalletId exists
      let balance = 0;
      if (user.circleWalletId) {
        try {
          balance = await CircleService.getWalletUSDCBalance(user.circleWalletId);
          logger.info(`💰 Fetched wallet balance for user ${userId}: ${balance} USDC`);
        } catch (balanceError: any) {
          logger.error(`⚠️ Failed to fetch balance for user ${userId}: ${balanceError.message}`);
          // Continue without balance, default is 0
        }
      }

      // Fetch transactions for this user within date range
      const tips = await Transaction.find({
        recipient: userId,
        createdAt: { $gte: startDateTime, $lte: endDateTime },
        status: 'completed'
      }).sort({ createdAt: -1 });

      // Calculate metrics
      const totalTips = tips.length;
      const totalValue = tips.reduce((sum, tip) => sum + tip.amount, 0);
      const avgTipValue = totalTips > 0 ? totalValue / totalTips : 0;

      // Get tokens used and find the most common one
      const tokenCounts = tips.reduce((acc, tip) => {
        const token = tip.currency || 'USDC';
        acc[token] = (acc[token] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topToken = Object.entries(tokenCounts).reduce(
        (max, [token, count]) => (count > max.count ? { token, count } : max),
        { token: 'USDC', count: 0 }
      ).token;

      // Calculate weekly stats for growth percentage
      const oneWeekAgo = new Date(endDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(endDateTime.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      // This week's tips
      const thisWeekTips = tips.filter(tip => 
        new Date(tip.createdAt) >= oneWeekAgo && new Date(tip.createdAt) <= endDateTime
      );
      const thisWeekValue = thisWeekTips.reduce((sum, tip) => sum + tip.amount, 0);
      
      // Last week's tips
      const lastWeekTips = tips.filter(tip => 
        new Date(tip.createdAt) >= twoWeeksAgo && new Date(tip.createdAt) < oneWeekAgo
      );
      const lastWeekValue = lastWeekTips.reduce((sum, tip) => sum + tip.amount, 0);
      
      // Calculate growth percentage
      const weeklyGrowth = lastWeekValue > 0 
        ? ((thisWeekValue - lastWeekValue) / lastWeekValue) * 100 
        : (thisWeekValue > 0 ? 100 : 0);

      // Generate data for weekly volume chart
      const weeklyVolume = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(endDateTime.getTime() - i * 24 * 60 * 60 * 1000);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayTips = tips.filter(tip => 
          new Date(tip.createdAt) >= dayStart && new Date(tip.createdAt) <= dayEnd
        );
        
        const dayTotal = dayTips.reduce((sum, tip) => sum + tip.amount, 0);
        weeklyVolume.push(parseFloat(dayTotal.toFixed(2)));
      }
      
      // Get recent tips (5 most recent ones)
      const recentTips = tips.slice(0, 5).map(tip => ({
        id: tip._id,
        sender: tip.sender?.username || 'Anonymous',
        amount: tip.amount,
        tokenType: tip.currency || 'USDC',
        message: tip.message || '',
        timestamp: tip.createdAt,
        status: tip.status
      }));

      return sendSuccess({
        res,
        message: 'Dashboard analytics retrieved successfully ✅',
        data: {
          metrics: {
            totalTips,
            totalValue: parseFloat(totalValue.toFixed(2)),
            avgTipValue: parseFloat(avgTipValue.toFixed(2)),
            topToken,
            weeklyGrowth: parseFloat(weeklyGrowth.toFixed(2)),
            balance,
            monthlyVolume: weeklyVolume
          },
          recentTips
        }
      });
    } catch (error) {
      logger.error('Error fetching dashboard analytics:', error);
      return handleControllerError(error, res);
    }
  }
}