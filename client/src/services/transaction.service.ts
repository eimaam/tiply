import { privateApi } from '@/lib/api';

/**
 * Interface for withdrawal request
 */
export interface WithdrawalRequest {
  withdrawalAddress: string;
  amount: number;
}

/**
 * Interface for withdrawal response
 */
export interface WithdrawalResponse {
  transactionId: string;
  circleTransactionId: string;
  status: string;
  amount: number;
  withdrawalAddress: string;
  createdAt: string;
}

/**
 * Interface for withdrawal status
 */
export interface WithdrawalStatus {
  transactionId: string;
  circleTransactionId: string;
  status: string;
  amount: number;
  walletAddress: string;
  createdAt: string;
  completedAt?: string;
  circleDetails?: {
    status: string;
    amount: string;
    destinationAddress: string;
    txHash?: string;
    errorReason?: string;
    updatedAt: string;
  };
}

/**
 * Transaction Service for handling transactions, tips, and withdrawals
 */
export const transactionService = {
  /**
   * Create a withdrawal request
   * @param data - Withdrawal request data
   * @returns Withdrawal response
   */
  createWithdrawal: async (data: WithdrawalRequest): Promise<WithdrawalResponse> => {
    try {
      // Create the withdrawal transaction
      const response = await privateApi.post('/transactions/withdrawals', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create withdrawal:', error);
      throw error;
    }
  },
  
  /**
   * Get status of a withdrawal transaction
   * @param transactionId - Transaction ID to check status for
   * @returns Withdrawal status
   */
  getWithdrawalStatus: async (transactionId: string): Promise<WithdrawalStatus> => {
    try {
      const response = await privateApi.get(`/transactions/withdrawals/${transactionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get withdrawal status:', error);
      throw error;
    }
  },
  
  /**
   * Get user's transaction history
   * @param params - Query parameters for filtering
   * @returns Transaction list
   */
  getTransactions: async (params?: Record<string, any>) => {
    try {
      const response = await privateApi.get('/transactions', { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific transaction by ID
   * @param transactionId - Transaction ID to fetch
   * @returns Transaction details
   */
  getTransaction: async (transactionId: string) => {
    try {
      const response = await privateApi.get(`/transactions/${transactionId}`);
      return response.data.data.transaction;
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      throw error;
    }
  }
};