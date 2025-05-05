import * as React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext'; // Import useUser hook
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  LineChartOutlined, 
  CopyOutlined, 
  SettingOutlined, 
  DollarOutlined,
  RiseOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  FileTextOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import DataFilter from '@/components/ui/filters/DataFilter';
import { DataFilter as DataFilterType } from '@/lib/types/filters';
import { CurrencyType, TransactionStatus, TransactionType } from '@/lib/types/transaction';
import { MetricCard } from '@/components/ui/dashboard/MetricCard';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { BarChart, ChartData } from '@/components/ui/dashboard/BarChart';
import { TransactionCard } from '@/components/ui/dashboard/TransactionCard';
import { Withdrawal } from '@/components/wallet/Withdrawal';
import { message } from 'antd';
import { TransactionStatusEnum } from '@/types/transaction';
import { analyticsService, DashboardMetrics, RecentTip } from '@/services/analytics.service';

// Set current user's premium status for demo purposes
const USER_IS_PREMIUM = false;

export function Dashboard() {
  const { user, refreshUser } = useUser(); // Get user data and refreshUser from context
  const [copied, setCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const tipLink = `https://usetiply.xyz/${user?.username || 'your-username'}`;
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
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
  
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tipLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
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
      
      // Refresh analytics to get updated balance
      await fetchAnalytics();
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

  // Update the tip link whenever the username changes
  React.useEffect(() => {
    if (user?.username) {
      // Update the tip link with the actual username
    }
  }, [user?.username]);

  return (
    <div className="min-h-screen bg-brand-background">
      <SidebarNav username={user?.username || 'loading...'} />

      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Dashboard Filter */}
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Dashboard Filters"
            className="mb-8"
            actionLabel={!USER_IS_PREMIUM ? 'Upgrade for advanced filters' : undefined}
            onAction={!USER_IS_PREMIUM ? () => { window.location.href = '/pricing'; } : undefined}
            icon={!USER_IS_PREMIUM ? <FilterOutlined /> : undefined}
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
            />
            
            {!USER_IS_PREMIUM && (
              <div className="mt-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg text-sm">
                <p className="text-brand-muted-foreground">Free users can view up to 14 days of transaction history. <a href="/pricing" className="text-brand-primary hover:underline">Upgrade to premium</a> for unlimited history and advanced filters.</p>
              </div>
            )}
          </DashboardCard>
        </motion.div>

        {/* Top Stats Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Total Earnings"
            value={metrics.totalValue}
            prefix="$"
            suffix=" USDC"
            loading={isLoading}
            icon={<DollarOutlined />}
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
            title="Avg. Tip Value"
            value={metrics.avgTipValue}
            prefix="$"
            suffix=" USDC"
            loading={isLoading}
            icon={<LineChartOutlined />}
          />

          <MetricCard
            title="Available Balance"
            value={currentBalance}
            prefix="$"
            suffix=" USDC"
            loading={isLoading}
            icon={<WalletOutlined />}
            action={<Withdrawal balance={currentBalance} onWithdraw={handleWithdrawal} />}
          />
        </motion.div>
        
        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Your Personal Tip Link"
                gradient={true}
                className="mb-8"
              >
                <div className="flex gap-2 relative z-10">
                  <Input 
                    value={tipLink} 
                    readOnly
                    className="font-mono text-sm bg-opacity-70"
                  />
                  <Button
                    variant={copied ? "default" : "outline"}
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0 transition-all duration-300"
                  >
                    {copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                  </Button>
                </div>
                <p className="mt-4 text-sm text-brand-muted-foreground">
                  Share this link with your audience to receive tips. Tips are sent directly to your connected wallet.
                </p>
              </DashboardCard>
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
                      <FileTextOutlined style={{ fontSize: '24px' }} className="text-brand-muted-foreground mb-2" />
                      <p className="text-brand-muted-foreground">No tips found matching your filters</p>
                      <Button 
                        variant="link" 
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </div>
                
                {visibleTips.length > 0 && recentTips.length > visibleTips.length && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline"
                      onClick={() => setVisibleTips(recentTips.slice(0, visibleTips.length + 5))}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </DashboardCard>
            </motion.div>
          </div>
          
          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            <DashboardCard
              title="Profile Settings"
              icon={<SettingOutlined />}
            >
              <form className="space-y-4">
                <Input label="Display Name" defaultValue={user?.displayName || ""} />
                <Input label="Username" defaultValue={user?.username || ""} />
                <Input label="Wallet Address" defaultValue={user?.walletAddress || "Not connected"} readOnly />
                <Textarea label="Bio" defaultValue={user?.bio || ""} />
                <Button className="w-full">Save Changes</Button>
              </form>
            </DashboardCard>

            <DashboardCard
              title="Token Preferences"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-brand-border flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">$</div>
                    <span className="ml-3">USDC</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-brand-muted-foreground mr-2">Primary</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-brand-border flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
                    <span className="ml-3">SOL</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-brand-muted-foreground mr-2">Enabled</span>
                    <div className="w-4 h-4 border-2 border-brand-border rounded-full"></div>
                  </div>
                </div>
                {/* TODO: enable feature later */}
                {/* <Button variant="outline" className="w-full">+ Add Token</Button> */}
              </div>
            </DashboardCard>
            
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}