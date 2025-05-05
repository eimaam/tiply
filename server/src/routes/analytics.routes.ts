import { Router } from 'express';
import { authenticate, withAuth } from '../middleware/auth.middleware';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { validation } from '../middleware/validation.middleware';

const router = Router();

/**
 * Analytics Routes
 * All routes require authentication
 */

// Get dashboard analytics
router.get(
  '/dashboard',
  authenticate,
  validation({
    query: {
      startDate: { type: 'string', optional: true }, // ISO date string
      endDate: { type: 'string', optional: true }, // ISO date string
    }
  }),
  withAuth(AnalyticsController.getDashboardAnalytics)
);

export default router;