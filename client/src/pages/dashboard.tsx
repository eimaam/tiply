import * as React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Tabs, message, Skeleton, Empty, Spin } from 'antd';
import { 
  LineChartOutlined, 
  SettingOutlined, 
  RiseOutlined,
  UserOutlined,
  FileTextOutlined,
  FilterOutlined,
  WalletOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import DataFilter from '@/components/ui/filters/DataFilter';
import { DataFilter as DataFilterType } from '@/lib/types/filters';
import { CurrencyType, TransactionStatus, TransactionType } from '@/lib/types/transaction';
import { MetricCard } from '@/components/ui/dashboard/MetricCard';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { BarChart, ChartData } from '@/components/ui/dashboard/BarChart';
import { TransactionCard } from '@/components/ui/dashboard/TransactionCard';
import { TransactionStatusEnum } from '@/types/transaction';
import { analyticsService, DashboardMetrics, RecentTip } from '@/services/analytics.service';
import { ProfileSettings } from '@/components/dashboard/ProfileSettings';
import { WalletSection } from '@/components/dashboard/WalletSection';
import { TipLinkSection } from '@/components/dashboard/TipLinkSection';

// Set current user's premium status for demo purposes
const USER_IS_PREMIUM = false;

export function Dashboard() {
  const { user, refreshUser } = useUser();
  const [activeTabKey, setActiveTabKey] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(true);
  
  // State for analytics data
  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    totalTips: 0,
    totalValue: 0,
    avgTipValue: 0,
    topToken: 'USDC',
    weeklyGrowth: 0,
    balance: 0,
    monthlyVolume: [0, 0, 0, 0, 0, 0, 0]
  });
  
  // State for recent tips
  const [recentTips, setRecentTips] = React.useState<RecentTip[]>([]);
  const [visibleTips, setVisibleTips] = React.useState<RecentTip[]>([]);
  
  // Filter state
  const [filters, setFilters] = React.useState<DataFilterType>({
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
    isPremiumUser: USER_IS_PREMIUM,
  });
  
  // Get balance from metrics or user
  const currentBalance = metrics.balance ?? user?.balance ?? 0;
  
  // Handle filter changes
  const handleFilterChange = (newFilters: DataFilterType) => {
    setIsLoading(true);
    setFilters(newFilters);
    
    // Fetch analytics with date filters
    fetchAnalytics(
      newFilters.startDate ? new Date(newFilters.startDate).toISOString() : undefined,
      newFilters.endDate ? new Date(newFilters.endDate).toISOString() : undefined
    );
  };

  // Apply filters to recent tips data
  const applyFilters = (tips: RecentTip[], appliedFilters: DataFilterType) => {
    let filteredTips = [...tips];
    
    // Apply search filter
    if (appliedFilters.searchQuery) {
      const searchLower = appliedFilters.searchQuery.toLowerCase();
      filteredTips = filteredTips.filter(tip => 
        tip.sender.toLowerCase().includes(searchLower) || 
        tip.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (appliedFilters.status) {
      filteredTips = filteredTips.filter(tip => tip.status === appliedFilters.status);
    }
    
    // Apply currency filter
    if (appliedFilters.currency) {
      filteredTips = filteredTips.filter(tip => tip.tokenType === appliedFilters.currency);
    }
    
    // Apply amount filters
    if (appliedFilters.minAmount !== undefined) {
      filteredTips = filteredTips.filter(tip => tip.amount >= appliedFilters.minAmount!);
    }
    
    if (appliedFilters.maxAmount !== undefined) {
      filteredTips = filteredTips.filter(tip => tip.amount <= appliedFilters.maxAmount!);
    }
    
    // Apply sorting
    if (appliedFilters.sortBy) {
      filteredTips.sort((a, b) => {
        const key = appliedFilters.sortBy!;
        const aValue = a[key as keyof RecentTip];
        const bValue = b[key as keyof RecentTip];
        
        if (aValue < bValue) {
          return appliedFilters.sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return appliedFilters.sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredTips;
  };
  
  // Format weekly chart data
  const getWeeklyChartData = (): ChartData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return metrics.monthlyVolume.map((value, index) => ({
      value,
      label: days[index % days.length],
      secondaryValue: `$${value.toFixed(2)} USDC`
    }));
  };
  
  // Fetch analytics data from API
  const fetchAnalytics = async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getDashboardAnalytics(startDate, endDate);
      setMetrics(data.metrics);
      setRecentTips(data.recentTips);
      
      // Apply current filters to recent tips
      const filteredTips = applyFilters(data.recentTips, filters);
      setVisibleTips(filteredTips.slice(0, 5));
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      message.error(error?.response?.data?.message || 'Failed to load dashboard data 😔');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters: DataFilterType = {
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
      isPremiumUser: USER_IS_PREMIUM,
    };
    
    setFilters(defaultFilters);
    fetchAnalytics();
  };

  // Handle withdrawal submission
  const handleWithdrawal = async (address: string, amount: number): Promise<boolean> => {
    console.log(`💸 Attempting to withdraw ${amount} USDC to wallet ${address}`);
    
    try {
      // In a complete implementation, you would call your backend API here
      // Example: await api.transactions.createWithdrawal({ address, amount });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      message.success('Withdrawal initiated successfully! 🚀 It may take a few moments to reflect.');
      
      // Refresh analytics and user data to get updated balance and wallet info
      await fetchAnalytics();
      await refreshUser();
      return true;
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      message.error(error?.response?.data?.message || 'Withdrawal failed. Please try again. 😔');
      return false;
    }
  };

  // Load analytics data on component mount
  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  // Tab items configuration
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <>
          {/* Top Stats Section */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <MetricCard
              title="Total Earnings"
              value={metrics.totalValue}
              prefix="$"
              suffix=" USDC"
              loading={isLoading}
              icon={<LineChartOutlined />}
            />
            
            <MetricCard
              title="Total Tips"
              value={metrics.totalTips}
              loading={isLoading}
              icon={<UserOutlined />}
            />
            
            <MetricCard
              title="Weekly Growth"
              value={metrics.weeklyGrowth}
              prefix={metrics.weeklyGrowth >= 0 ? "+" : ""}
              suffix="%"
              loading={isLoading}
              icon={<RiseOutlined />}
              iconBgClassName={metrics.weeklyGrowth >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
            />
            
            <MetricCard
              title="Available Balance"
              value={currentBalance}
              prefix="$"
              suffix=" USDC"
              loading={isLoading}
              icon={<WalletOutlined />}
              action={currentBalance > 0 ? (
                <div className="text-xs flex space-x-1">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button 
                      onClick={() => setActiveTabKey('wallet')}
                      className="text-brand-primary hover:text-brand-primary/80 hover:underline"
                    >
                      Withdraw
                    </button>
                  </motion.div>
                </div>
              ) : null}
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants}>
                <TipLinkSection username={user?.username || 'your-username'} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="Recent Tips"
                  actionLabel="View All"
                  onAction={() => console.log("View all tips")}
                >
                  <div className="space-y-4">
                    {isLoading ? (
                      // Loading skeleton
                      Array(3).fill(0).map((_, index) => (
                        <div key={index} className="p-4 rounded-lg border border-brand-border">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="h-5 w-24 bg-brand-border/30 rounded animate-pulse"></div>
                              <div className="h-4 w-48 bg-brand-border/30 rounded animate-pulse"></div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="h-5 w-16 bg-brand-border/30 rounded animate-pulse"></div>
                              <div className="h-4 w-12 bg-brand-border/30 rounded animate-pulse ml-auto"></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : visibleTips.length > 0 ? (
                      visibleTips.map(tip => (
                        <TransactionCard
                          key={tip.id}
                          id={tip.id}
                          type="tip"
                          user={tip.sender}
                          details={tip.message}
                          timestamp={tip.timestamp}
                          amount={tip.amount}
                          currency={tip.tokenType}
                          status={TransactionStatusEnum.COMPLETED}
                        />
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <Empty 
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <span className="text-brand-muted-foreground">
                              No tips found matching your filters
                            </span>
                          }
                        />
                        <span 
                          className="text-brand-primary hover:underline cursor-pointer"
                          onClick={resetFilters}
                        >
                          Reset Filters
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {visibleTips.length > 0 && recentTips.length > visibleTips.length && (
                    <div className="mt-6 text-center">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <button 
                          className="px-4 py-2 border border-brand-border rounded-md hover:bg-brand-accent/10 transition-colors"
                          onClick={() => setVisibleTips(recentTips.slice(0, visibleTips.length + 5))}
                        >
                          Load More
                        </button>
                      </motion.div>
                    </div>
                  )}
                </DashboardCard>
              </motion.div>
            </div>
            
            {/* Right Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Weekly Volume Chart */}
              <DashboardCard
                title="Weekly Volume"
              >
                <BarChart
                  data={getWeeklyChartData()}
                  height={160}
                  isLoading={isLoading}
                  valuePrefix="$"
                  valueSuffix=" USDC"
                  showTooltip={true}
                />
              </DashboardCard>
              
              {/* Filters Card */}
              <DashboardCard
                title="Filter Tips"
                className="mb-8"
                actionLabel={!USER_IS_PREMIUM ? 'Upgrade' : undefined}
                onAction={!USER_IS_PREMIUM ? () => { window.location.href = '/pricing'; } : undefined}
                icon={<FilterOutlined />}
              >
                <DataFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  isPremiumUser={USER_IS_PREMIUM}
                  availableTypes={[TransactionType.TIP]}
                  availableStatuses={Object.values(TransactionStatus)}
                  currencies={Object.values(CurrencyType)}
                  showReset={true}
                  className="mb-4"
                  compact={true}
                />
                
                {!USER_IS_PREMIUM && (
                  <div className="mt-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg text-sm">
                    <p className="text-brand-muted-foreground">Free users can view up to 14 days of tips. <a href="/pricing" className="text-brand-primary hover:underline">Upgrade</a> for more data.</p>
                  </div>
                )}
              </DashboardCard>
            </motion.div>
          </div>
        </>
      )
    },
    {
      key: 'profile',
      label: 'Profile Settings',
      children: (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCard
              title="Edit Your Profile"
              icon={<SettingOutlined />}
            >
              <ProfileSettings />
            </DashboardCard>
          </div>
          
          <div>
            <DashboardCard
              title="Preview"
              className="mb-6"
            >
              <div className="flex flex-col items-center space-y-4 p-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.displayName || user.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-primary/20 text-brand-primary text-2xl">
                        {user?.displayName?.[0] || user?.username?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-bold text-lg">{user?.displayName || 'Your Name'}</h3>
                  <p className="text-brand-muted-foreground">@{user?.username || 'username'}</p>
                  <p className="text-sm mt-2 max-w-xs text-center line-clamp-3">
                    {user?.bio || 'Your bio will appear here...'}
                  </p>
                </div>
                
                <div className="mt-2 p-3 bg-brand-accent/10 rounded-lg w-full text-center">
                  <p className="text-brand-primary text-sm">This is how your profile looks to visitors</p>
                </div>
              </div>
            </DashboardCard>
            
            <DashboardCard
              title="Profile URL"
            >
              <div className="text-center">
                <p className="mb-3 text-sm text-brand-muted-foreground">
                  Your public profile is available at:
                </p>
                <div className="font-mono text-sm bg-brand-accent/10 p-3 rounded-lg">
                  usetiply.xyz/{user?.username || 'your-username'}
                </div>
                <a 
                  href={`https://usetiply.xyz/${user?.username || 'your-username'}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="mt-3 inline-block text-brand-primary hover:underline text-sm"
                >
                  Open in new tab <LinkOutlined />
                </a>
              </div>
            </DashboardCard>
          </div>
        </div>
      )
    },
    {
      key: 'wallet',
      label: 'Wallet',
      children: (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WalletSection 
              user={user} 
              balance={currentBalance}
              onWithdraw={handleWithdrawal}
            />
          </div>
          
          <div className="space-y-6">
            <DashboardCard
              title="Transaction History"
            >
              <div className="space-y-4">
                {isLoading ? (
                  <div className="py-6 text-center">
                    <Spin />
                    <div className="mt-2 text-brand-muted-foreground text-sm">
                      Loading transactions...
                    </div>
                  </div>
                ) : visibleTips.length > 0 ? (
                  visibleTips.slice(0, 3).map(tip => (
                    <TransactionCard
                      key={tip.id}
                      id={tip.id}
                      type="tip"
                      user={tip.sender}
                      details={tip.message}
                      timestamp={tip.timestamp}
                      amount={tip.amount}
                      currency={tip.tokenType}
                      status={TransactionStatusEnum.COMPLETED}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-brand-muted-foreground">
                          No recent transactions
                        </span>
                      }
                    />
                  </div>
                )}
              </div>
              
              {visibleTips.length > 0 && (
                <div className="mt-4 text-center">
                  <span 
                    className="text-brand-primary hover:underline cursor-pointer text-sm"
                    onClick={() => setActiveTabKey('overview')}
                  >
                    View all transactions
                  </span>
                </div>
              )}
              
            </DashboardCard>
            
            <DashboardCard
              title="Balance Chart"
            >
              <BarChart
                data={getWeeklyChartData()}
                height={160}
                isLoading={isLoading}
                valuePrefix="$"
                valueSuffix=" USDC"
                showTooltip={true}
              />
            </DashboardCard>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-brand-background">
      <SidebarNav username={user?.username || 'loading...'} />

      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Tabs 
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={tabItems}
          className="dashboard-tabs"
          type="card"
        />
      </motion.div>
    </div>
  );
}