import { Request, Response } from 'express';
import Waitlist from '../models/Waitlist';
import { responseHandler } from '../utils/responseHandler';
import { logger } from '../utils/logger';

class WaitlistController {
  /**
   * Add a new email to the waitlist
   * @route POST /api/v1/waitlist
   * @access Public
   */
  public static async joinWaitlist(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Validate required fields
      if (!email) {
        return responseHandler.badRequest(res, 'Email is required');
      }

      // Check if email already exists in waitlist
      const existingEntry = await Waitlist.findOne({ email: { $regex: `^${email}$`, $options: "i"} });
      if (existingEntry) {
        return responseHandler.conflict(res, 'Email is already on the waitlist');
      }

      // Create new waitlist entry
      await Waitlist.create({ email });

      return responseHandler.created(res, 'Successfully joined the waitlist', {
        email,
      });
    } catch (error) {
      logger.error('Join waitlist error:', error);
      return responseHandler.serverError(res, 'Failed to join waitlist');
    }
  }

  /**
   * Get all waitlist entries
   * @route GET /api/v1/waitlist
   * @access Private (Admin only)
   */
  public static async getWaitlist(req: Request, res: Response) {
    try {

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const waitlist = await Waitlist.find()
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Waitlist.countDocuments();

      return responseHandler.success(res, 'Waitlist retrieved successfully', {
        waitlist,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      });
    } catch (error) {
      console.error('Get waitlist error:', error);
      return responseHandler.serverError(res, 'Failed to retrieve waitlist');
    }
  }
}

export default WaitlistController;