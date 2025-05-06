import { privateApi } from '@/lib/api';

/**
 * Interface for withdrawal request
 */
export interface WithdrawalRequest {
  address: string;
  amount: number;
}

/**
 * Interface for withdrawal response
 */
export interface WithdrawalResponse {
  id: string;
  status: string;
  amount: number;
  fee?: number;
  netAmount: number;
  address: string;
  txHash?: string;
  createdAt: string;
}

/**
 * Transaction Service for handling transactions, tips, and withdrawals
 */
export const transactionService = {
  /**
   * Create a withdrawal request and save the withdrawal address to user profile
   * @param data - Withdrawal request data
   * @returns Withdrawal response
   */
  createWithdrawal: async (data: WithdrawalRequest): Promise<WithdrawalResponse> => {
    try {
      // First update the user's withdrawalWalletAddress
      await privateApi.put('/users/profile/wallet', {
        withdrawalWalletAddress: data.address
      });
      
      // Then create the withdrawal transaction
      const response = await privateApi.post('/transactions/withdraw', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create withdrawal:', error);
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
};