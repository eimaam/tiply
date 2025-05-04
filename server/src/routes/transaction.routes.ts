import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authenticate, withAuth, hasRole } from '../middleware/auth.middleware';
import { 
  apiRateLimiter, 
  financialOperationsRateLimiter, 
  adminRateLimiter 
} from '../middleware/rate-limit.middleware';

const router = Router();



/**
 * User Transaction Routes
 */
// Get user transactions - standard API rate limiting
router.get('/', authenticate, apiRateLimiter, withAuth(TransactionController.getUserTransactions));

// Get transaction by ID - standard API rate limiting
router.get('/:transactionId', authenticate, apiRateLimiter, withAuth(TransactionController.getTransactionById));

/**
 * Withdrawal Routes - Highly secured with strict rate limiting
 */
// Create withdrawal request - Apply strict financial operations rate limiter
router.post('/withdrawals', authenticate, financialOperationsRateLimiter, withAuth(TransactionController.createWithdrawal));

/**
 * Admin Routes - Accessible by admins only
 */
// Get all transactions (admin only) - Apply admin-specific rate limiter
router.get('/admin/transactions', 
  authenticate,
  hasRole(['admin', 'super_admin']), 
  adminRateLimiter,
  withAuth(TransactionController.getAllTransactions)
);

// Update transaction status (admin only) - Apply admin-specific rate limiter
router.patch('/admin/transactions/:transactionId/status', 
  authenticate,
  hasRole(['admin', 'super_admin']),
  adminRateLimiter,
  withAuth(TransactionController.updateTransactionStatus)
);

export default router;