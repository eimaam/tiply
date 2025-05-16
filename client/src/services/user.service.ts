import api, { privateApi, publicApi } from '@/lib/api';
import { User } from '@/lib/types/user';

interface UsernameCheckResponse {
  available: boolean;
  message: string;
}

/**
 * Service for user-related API calls
 */
export const userService = {
  /**
   * Get the current user's profile information
   */
  getProfile: async (): Promise<{ data: User }> => {
    try {
      const response = await api.user.getProfile();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  /**
   * Update the user's profile information
   * @param profileData - The profile data to update
   */
  updateProfile: async (profileData: any): Promise<{ data: User }> => {
    try {
      const response = await api.user.updateProfile(profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Update the user's wallet address for withdrawals
   * @param address - The wallet address to set for withdrawals
   */
  updateWalletAddress: async (address: string): Promise<{ data: User }> => {
    try {
      const response = await privateApi.put('/users/profile/wallet', { withdrawalWalletAddress: address });
      return response.data;
    } catch (error) {
      console.error('Failed to update wallet address:', error);
      throw error;
    }
  },

  /**
   * Check if a username is available
   * @param username - The username to check availability for
   */
  checkUsernameAvailability: async (username: string): Promise<UsernameCheckResponse> => {
    try {
      const response = await publicApi.get(`/auth/check-username/${username}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to check username availability:', error);
      throw error;
    }
  },

  /**
   * Get the user's transaction history
   * @param params - Optional query parameters like page, limit, etc.
   */
  getTransactionHistory: async (params?: any): Promise<{ data: any }> => {
    try {
      const response = await api.transactions.getAll(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  },

  /**
   * Request a withdrawal of funds to the user's withdrawal wallet
   * @param amount - The amount to withdraw
   */
  requestWithdrawal: async (amount: number): Promise<{ data: any }> => {
    try {
      // Get the user's withdrawal wallet address
      const userResponse = await privateApi.get('/auth/me');
      const withdrawalWalletAddress = userResponse.data?.data?.user?.withdrawalWalletAddress;
      
      if (!withdrawalWalletAddress) {
        throw new Error('No withdrawal wallet address set. Please set a withdrawal address first.');
      }
      
      // Use the transaction service to initiate the withdrawal
      const response = await privateApi.post('/transactions/withdrawals', { 
        withdrawalAddress: withdrawalWalletAddress,
        amount 
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to request withdrawal:', error);
      throw error;
    }
  },

  /**
   * Get the user's wallet balance
   */
  getWalletBalance: async (): Promise<{ data: { balance: number } }> => {
    try {
      const response = await privateApi.get('/user/balance');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  },
  
  /**
   * Get a user's public profile by username
   * @param username - The username to look up
   */
  getPublicProfile: async (username: string): Promise<{ data: Partial<User> }> => {
    try {
      const response = await publicApi.get(`/user/profile/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch profile for ${username}:`, error);
      throw error;
    }
  },

  getTipSettings: async () => {
    const response = await publicApi.get('/users/tip-settings');
    return response.data;
  },

  updateTipSettings: async (settings: any) => {
    const response = await publicApi.put('/users/tip-settings', settings);
    return response.data;
  },
};