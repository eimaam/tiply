import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  PieChartOutlined,
  TeamOutlined,
  LineChartOutlined,
  BellOutlined,
  SettingOutlined,
  AppstoreOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import DataFilter from '@/components/ui/filters/DataFilter';
import { DataFilter as DataFilterType } from '@/lib/types/filters';
import { CurrencyType, TransactionStatus, TransactionType } from '@/lib/types/transaction';
import { MetricCard } from '@/components/ui/dashboard/MetricCard';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { BarChart, ChartData } from '@/components/ui/dashboard/BarChart';
import { TransactionCard } from '@/components/ui/dashboard/TransactionCard';

// Original mock data - we'll use this as base data before filtering
const originalOverviewStats = {
  totalRevenue: 87652.50,
  totalUsers: 4320,
  activeUsers: 2876,
  monthlyGrowth: 12.6,
  userGrowth: 8.3,
  totalTips: 15940,
  tipSuccessRate: 99.2,
  averageTipAmount: 28.50,
  pendingTransactions: 8
};

// Monthly data for historical filtering
const monthlyData = {
  '2025-04': { totalRevenue: 87652.50, totalUsers: 4320, activeUsers: 2876, totalTips: 15940, averageTipAmount: 28.50, pendingTransactions: 8 },
  '2025-03': { totalRevenue: 78920.30, totalUsers: 4100, activeUsers: 2700, totalTips: 14200, averageTipAmount: 27.30, pendingTransactions: 12 },
  '2025-02': { totalRevenue: 65420.75, totalUsers: 3850, activeUsers: 2500, totalTips: 12500, averageTipAmount: 26.80, pendingTransactions: 15 },
  '2025-01': { totalRevenue: 58760.90, totalUsers: 3600, activeUsers: 2300, totalTips: 11300, averageTipAmount: 25.40, pendingTransactions: 10 },
  '2024-12': { totalRevenue: 52350.20, totalUsers: 3200, activeUsers: 2100, totalTips: 10200, averageTipAmount: 24.20, pendingTransactions: 7 },
  '2024-11': { totalRevenue: 48235.70, totalUsers: 2900, activeUsers: 1950, totalTips: 9500, averageTipAmount: 23.80, pendingTransactions: 5 },
};

// Original weekly data
const originalWeeklyData = [
  { day: 'Mon', transactions: 120, revenue: 3240, users: 87 },
  { day: 'Tue', transactions: 132, revenue: 3580, users: 92 },
  { day: 'Wed', transactions: 101, revenue: 2730, users: 84 },
  { day: 'Thu', transactions: 134, revenue: 3620, users: 90 },
  { day: 'Fri', transactions: 156, revenue: 4212, users: 98 },
  { day: 'Sat', transactions: 168, revenue: 4536, users: 105 },
  { day: 'Sun', transactions: 129, revenue: 3483, users: 87 }
];

// Recent activity data
const originalRecentActivity = [
  {
    id: 1,
    type: 'new_user',
    user: 'Alex Johnson',
    details: 'created a new account',
    timestamp: '2025-04-11T11:30:00Z',
    amount: 0
  },
  {
    id: 2,
    type: 'large_tip',
    user: 'Maria Garcia',
    details: 'received $250.00 tip from Anonymous',
    timestamp: '2025-04-11T10:45:20Z',
    amount: 250.00,
    transactionType: 'tip',
    status: 'completed'
  },
  {
    id: 3,
    type: 'transaction_error',
    user: 'James Wilson',
    details: 'encountered payment error: Insufficient funds',
    timestamp: '2025-04-11T09:12:15Z',
    amount: 125.00,
    transactionType: 'tip',
    status: 'failed'
  },
  {
    id: 4,
    type: 'withdrawal',
    user: 'Sophie Taylor',
    details: 'withdrawn $1,500.00 to external wallet',
    timestamp: '2025-04-11T08:05:38Z',
    amount: 1500.00,
    transactionType: 'withdrawal',
    status: 'completed'
  },
  {
    id: 5,
    type: 'new_user',
    user: 'Daniel Brown',
    details: 'created a new account',
    timestamp: '2025-04-11T07:30:12Z',
    amount: 0
  },
  {
    id: 6,
    type: 'large_tip',
    user: 'Emma Davis',
    details: 'received $175.00 tip from RegularSupporter',
    timestamp: '2025-04-10T15:22:33Z',
    amount: 175.00,
    transactionType: 'tip',
    status: 'completed'
  },
  {
    id: 7,
    type: 'large_tip',
    user: 'Noah Wilson',
    details: 'received $300.00 tip from BigFan',
    timestamp: '2025-04-09T12:18:45Z',
    amount: 300.00,
    transactionType: 'tip',
    status: 'completed'
  },
  {
    id: 8,
    type: 'transaction_error',
    user: 'Olivia Johnson',
    details: 'encountered payment error: Network timeout',
    timestamp: '2025-04-08T09:44:10Z',
    amount: 50.00,
    transactionType: 'tip',
    status: 'failed'
  },
];

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState(originalOverviewStats);
  const [weeklyData, setWeeklyData] = useState(originalWeeklyData);
  const [recentActivity, setRecentActivity] = useState(originalRecentActivity.slice(0, 5));

  // Filter state
  const [filters, setFilters] = useState<DataFilterType>({
    searchQuery: '',
    startDate: undefined,
    endDate: undefined,
    type: undefined,
    status: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    currency: undefined,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: DataFilterType) => {
    setIsLoading(true);
    setFilters(newFilters);
    
    // Short delay to simulate loading
    setTimeout(() => {
      applyFilters(newFilters);
      setIsLoading(false);
    }, 600);
  };

  // Apply filters to data
  const applyFilters = (appliedFilters: DataFilterType) => {
    // Filter recent activity
    let filteredActivity = [...originalRecentActivity];
    
    // Apply search filter
    if (appliedFilters.searchQuery) {
      const searchLower = appliedFilters.searchQuery.toLowerCase();
      filteredActivity = filteredActivity.filter(activity => 
        activity.user.toLowerCase().includes(searchLower) || 
        activity.details.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply transaction type filter
    if (appliedFilters.type) {
      filteredActivity = filteredActivity.filter(activity => 
        activity.transactionType === appliedFilters.type
      );
    }
    
    // Apply status filter
    if (appliedFilters.status) {
      filteredActivity = filteredActivity.filter(activity => 
        activity.status === appliedFilters.status
      );
    }
    
    // Apply date range filters
    if (appliedFilters.startDate) {
      const startDate = new Date(appliedFilters.startDate);
      filteredActivity = filteredActivity.filter(activity => 
        new Date(activity.timestamp) >= startDate
      );
    }
    
    if (appliedFilters.endDate) {
      const endDate = new Date(appliedFilters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filteredActivity = filteredActivity.filter(activity => 
        new Date(activity.timestamp) <= endDate
      );
    }
    
    // Apply amount filters
    if (appliedFilters.minAmount !== undefined) {
      filteredActivity = filteredActivity.filter(activity => 
        activity.amount >= appliedFilters.minAmount!
      );
    }
    
    if (appliedFilters.maxAmount !== undefined) {
      filteredActivity = filteredActivity.filter(activity => 
        activity.amount <= appliedFilters.maxAmount!
      );
    }

    // Update recent activity (always take first 5 for display)
    setRecentActivity(filteredActivity.slice(0, 5));
    
    // Update stats based on filters
    let filteredRevenue = 0;
    let filteredTips = 0;
    let filteredSuccessCount = 0;
    let filteredFailedCount = 0;
    let filteredPendingCount = 0;
    let filteredTotalAmount = 0;

    // Calculate filtered stats
    filteredActivity.forEach(activity => {
      if (activity.transactionType === 'tip' || activity.transactionType === 'withdrawal') {
        filteredRevenue += activity.amount;
        
        if (activity.transactionType === 'tip') {
          filteredTips++;
          filteredTotalAmount += activity.amount;
        }
        
        if (activity.status === 'completed') {
          filteredSuccessCount++;
        } else if (activity.status === 'failed') {
          filteredFailedCount++;
        } else if (activity.status === 'pending') {
          filteredPendingCount++;
        }
      }
    });

    // If date filters were applied, adjust the stats based on date ranges
    if (appliedFilters.startDate || appliedFilters.endDate) {
      // Create modified stats based on filters
      const modifiedStats = { ...originalOverviewStats };
      
      // Determine which monthly data to use based on filters
      if (appliedFilters.startDate && appliedFilters.endDate) {
        const startDate = new Date(appliedFilters.startDate);
        const endDate = new Date(appliedFilters.endDate);
        
        // Format for lookup in monthly data
        const startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        const endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
        
        // If we have data for these months, use it
        if (monthlyData[startMonth] && monthlyData[endMonth]) {
          // If same month, just use that month's data
          if (startMonth === endMonth) {
            const monthData = monthlyData[startMonth];
            modifiedStats.totalRevenue = monthData.totalRevenue;
            modifiedStats.totalTips = monthData.totalTips;
            modifiedStats.averageTipAmount = monthData.averageTipAmount;
            modifiedStats.pendingTransactions = monthData.pendingTransactions;
          } else {
            // Otherwise approximate based on date range
            // This is simplified, in a real app you'd query your database
            modifiedStats.totalRevenue = originalOverviewStats.totalRevenue * 0.7;
            modifiedStats.totalTips = originalOverviewStats.totalTips * 0.7;
          }
        }
      }
      
      // Update the stats with our modified values
      setOverviewStats(modifiedStats);
    } else {
      // If no date filters, use original stats
      setOverviewStats(originalOverviewStats);
    }
    
    // Update weekly data based on filter (simplified - in a real app you'd query your database)
    // Here we're just reducing the values proportionally to simulate filtering
    if (appliedFilters.type || appliedFilters.status || appliedFilters.minAmount || appliedFilters.maxAmount) {
      const filterModifier = filteredActivity.length / originalRecentActivity.length;
      
      const modifiedWeeklyData = originalWeeklyData.map(day => ({
        ...day,
        transactions: Math.round(day.transactions * filterModifier),
        revenue: Math.round(day.revenue * filterModifier),
        users: Math.round(day.users * filterModifier),
      }));
      
      setWeeklyData(modifiedWeeklyData);
    } else {
      setWeeklyData(originalWeeklyData);
    }
  };

  // Convert weekly data to format required by BarChart component
  const getChartData = (): ChartData[] => {
    return weeklyData.map(day => ({
      label: day.day,
      value: day.revenue,
      secondaryValue: `${day.transactions} transactions`
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  return (
    <AdminLayout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Dashboard Filter */}
        <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Dashboard Filters</h3>
          <DataFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            isAdmin={true}
            availableTypes={Object.values(TransactionType)}
            availableStatuses={Object.values(TransactionStatus)}
            currencies={Object.values(CurrencyType)}
            showReset={true}
          />
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={overviewStats.totalRevenue}
            prefix="$"
            loading={isLoading}
            icon={<DollarOutlined />}
            change={{
              value: overviewStats.monthlyGrowth,
              isPositive: overviewStats.monthlyGrowth > 0
            }}
            helpText="vs last month"
          />

          <MetricCard
            title="Total Users"
            value={overviewStats.totalUsers}
            loading={isLoading}
            icon={<TeamOutlined />}
            change={{
              value: overviewStats.userGrowth,
              isPositive: true
            }}
            helpText="new signups"
          />

          <MetricCard
            title="Active Users"
            value={overviewStats.activeUsers}
            loading={isLoading}
            icon={<UserOutlined />}
            helpText={`${Math.round((overviewStats.activeUsers / overviewStats.totalUsers) * 100)}% of total`}
          />

          <MetricCard
            title="Success Rate"
            value={overviewStats.tipSuccessRate}
            suffix="%"
            loading={isLoading}
            icon={<LineChartOutlined />}
            iconBgClassName="bg-green-500/10"
            helpText={`${overviewStats.pendingTransactions} pending`}
          />
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <DashboardCard
            title="Weekly Performance"
            className="lg:col-span-2"
            actionLabel="Last 7 days"
            isLoading={isLoading}
          >
            <BarChart
              data={getChartData()}
              height={240}
              isLoading={isLoading}
              valuePrefix="$"
              summary={
                <div className="flex justify-around mt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatNumber(weeklyData.reduce((acc, day) => acc + day.transactions, 0))}</div>
                    <div className="text-brand-muted-foreground">Total Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${formatNumber(weeklyData.reduce((acc, day) => acc + day.revenue, 0))}</div>
                    <div className="text-brand-muted-foreground">Weekly Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${overviewStats.averageTipAmount}</div>
                    <div className="text-brand-muted-foreground">Avg Tip Size</div>
                  </div>
                </div>
              }
            />
          </DashboardCard>
          
          {/* Recent Activity */}
          <DashboardCard
            title="Recent Activity"
            isLoading={isLoading}
            actionLabel="View All"
            onAction={() => {/* Navigate to all activity */}}
          >
            <div className="overflow-hidden">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-brand-border/30 animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-brand-border/30 rounded animate-pulse"></div>
                        <div className="h-3 bg-brand-border/30 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div>
                  {recentActivity.map((activity) => (
                    <TransactionCard
                      key={activity.id}
                      id={activity.id}
                      type={activity.type}
                      user={activity.user}
                      details={activity.details}
                      timestamp={activity.timestamp}
                      amount={activity.amount}
                      status={activity.status}
                      currency="USDC"
                      showActionButton={true}
                      actionButtonText="Details"
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-brand-muted-foreground">No activity matches your current filters</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => {
                      setFilters({
                        searchQuery: '',
                        startDate: undefined,
                        endDate: undefined,
                        type: undefined,
                        status: undefined,
                        minAmount: undefined,
                        maxAmount: undefined,
                        currency: undefined,
                        sortBy: 'timestamp',
                        sortOrder: 'desc',
                      });
                      setRecentActivity(originalRecentActivity.slice(0, 5));
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="p-6 h-auto flex-col items-center gap-2">
              <UserOutlined style={{ fontSize: '24px' }} />
              <span>Manage Users</span>
            </Button>
            <Button className="p-6 h-auto flex-col items-center gap-2">
              <DollarOutlined style={{ fontSize: '24px' }} />
              <span>View Transactions</span>
            </Button>
            <Button className="p-6 h-auto flex-col items-center gap-2">
              <LineChartOutlined style={{ fontSize: '24px' }} />
              <span>Analytics Dashboard</span>
            </Button>
            <Button className="p-6 h-auto flex-col items-center gap-2">
              <SettingOutlined style={{ fontSize: '24px' }} />
              <span>Platform Settings</span>
            </Button>
          </div>
        </motion.div>
        
        {/* System Status */}
        <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">System Status</h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              All Systems Operational
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-brand-background rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">API Uptime</span>
                <span className="text-green-500">99.99%</span>
              </div>
              <div className="w-full bg-brand-border/30 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.99%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-brand-background rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Web App</span>
                <span className="text-green-500">99.95%</span>
              </div>
              <div className="w-full bg-brand-border/30 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.95%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-brand-background rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Payment Gateway</span>
                <span className="text-green-500">99.98%</span>
              </div>
              <div className="w-full bg-brand-border/30 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.98%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;