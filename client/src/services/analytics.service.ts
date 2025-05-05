import { privateApi } from '@/lib/api';

/**
 * Interface for dashboard metrics
 */
export interface DashboardMetrics {
  totalTips: number;
  totalValue: number;
  avgTipValue: number;
  topToken: string;
  weeklyGrowth: number;
  balance: number;
  monthlyVolume: number[];
}

/**
 * Interface for a tip/transaction in analytics
 */
export interface RecentTip {
  id: string;
  sender: string;
  amount: number;
  tokenType: string;
  message: string;
  timestamp: string;
  status: string;
}

/**
 * Interface for dashboard analytics data
 */
export interface DashboardAnalytics {
  metrics: DashboardMetrics;
  recentTips: RecentTip[];
}

/**
 * Analytics Service for fetching dashboard metrics and other analytics data
 */
export const analyticsService = {
  /**
   * Get dashboard analytics including metrics and recent tips
   * @param startDate - Optional start date for filtering (ISO string)
   * @param endDate - Optional end date for filtering (ISO string)
   * @returns Dashboard analytics data
   */
  getDashboardAnalytics: async (startDate?: string, endDate?: string): Promise<DashboardAnalytics> => {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await privateApi.get('/analytics/dashboard', { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      throw error;
    }
  },
};