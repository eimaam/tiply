import { Router } from 'express';
import { TipController } from '../controllers/TipController';
import { authenticate, hasPermission, withAuth } from '../middleware/auth.middleware';
import { validation, validateRequest } from '../middleware/validation.middleware';
import { apiRateLimiter, globalRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * @route GET /api/v1/tips
 * @desc Get all tips (admin only)
 * @access Private
 */
router.get('/',
  authenticate,
  hasPermission(['tips:manage']),
  apiRateLimiter,
  withAuth(TipController.getAllTips)
);

/**
 * @route GET /api/v1/tips/user/:userId
 * @desc Get tips for a specific user
 * @access Private
 */
router.get('/user/:userId',
  authenticate,
  apiRateLimiter,
  (req, res, next) => {
    // Allow if user is accessing their own tips or has admin permission
    if (req.user?.userId === req.params.userId || req.user?.permissions.includes('tips:manage')) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view these tips 🔒'
    });
  },
  withAuth(TipController.getUserTips)
);

/**
 * @route GET /api/v1/tips/:tipId
 * @desc Get tip by ID
 * @access Private
 */
router.get('/:tipId',
  authenticate,
  apiRateLimiter,
  withAuth(TipController.getTipById)
);

/**
 * @route POST /api/v1/tips
 * @desc Create a new tip
 * @access Public (with rate limiting)
 */
router.post('/',
  globalRateLimiter,
  validation({
    body: {
      amount: { type: 'number', required: true, min: 1 },
      recipientUsername: { type: 'string', required: true },
      message: { type: 'string', optional: true, maxLength: 500 },
      currency: { type: 'string', default: 'USDC' }
    }
  }),
  withAuth(TipController.createTip)
);

/**
 * @route POST /api/v1/tips/submit
 * @desc Submit a new tip
 * @access Public
 */
router.post('/submit', 
  validation({
    body: {
      txSignature: { type: 'string', required: true },
      amount: { type: 'number', required: true, min: 0 },
      recipientUsername: { type: 'string', required: true },
      message: { type: 'string', required: false },
      tipperWallet: { type: 'string', required: false }
    }
  }),
  TipController.submitTip
);

/**
 * @route PUT /api/v1/tips/:tipId
 * @desc Update tip status (admin only)
 * @access Private
 */
router.put('/:tipId',
  authenticate,
  hasPermission(['tips:manage']),
  validation({
    body: {
      status: { type: 'string', required: true }
    }
  }),
  withAuth(TipController.updateTipStatus)
);

/**
 * @route DELETE /api/v1/tips/:tipId
 * @desc Delete a tip (admin only)
 * @access Private
 */
router.delete('/:tipId',
  authenticate,
  hasPermission(['tips:manage']),
  withAuth(TipController.deleteTip)
);

export default router;