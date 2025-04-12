import * as React from 'react';
import { motion } from 'framer-motion';
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
  FileTextOutlined
} from '@ant-design/icons';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import DataFilter from '@/components/ui/filters/DataFilter';
import { DataFilter as DataFilterType } from '@/lib/types/filters';
import { CurrencyType, TransactionStatus, TransactionType } from '@/lib/types/transaction';
import { MetricCard } from '@/components/ui/dashboard/MetricCard';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { BarChart, ChartData } from '@/components/ui/dashboard/BarChart';
import { TransactionCard } from '@/components/ui/dashboard/TransactionCard';

// Set current user's premium status for demo purposes
const USER_IS_PREMIUM = false;

// Original transactions data
const originalTips = [
  { 
    id: '1', 
    sender: 'alex.eth', 
    amount: 0.05, 
    tokenType: 'USDC',
    message: 'Love your content! Keep it up!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'completed',
  },
  { 
    id: '2', 
    sender: 'crypto_whale.sol', 
    amount: 0.5, 
    tokenType: 'USDC',
    message: 'Great insights on the latest project',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    status: 'completed',
  },
  { 
    id: '3', 
    sender: 'web3_enthusiast', 
    amount: 0.1, 
    tokenType: 'USDC',
    message: 'Thanks for the help yesterday',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'completed',
  },
  { 
    id: '4', 
    sender: 'blockchain_maven', 
    amount: 0.2, 
    tokenType: 'USDC',
    message: 'For your great explanation on Twitter!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: 'completed',
  },
  { 
    id: '5', 
    sender: 'defi_buddy', 
    amount: 0.15, 
    tokenType: 'USDC',
    message: 'Keep sharing knowledge!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    status: 'completed',
  },
  { 
    id: '6', 
    sender: 'nft_collector', 
    amount: 0.3, 
    tokenType: 'USDC',
    message: 'Thanks for the NFT review!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    status: 'completed',
  },
  { 
    id: '7', 
    sender: 'anon_supporter', 
    amount: 0.25, 
    tokenType: 'USDC',
    message: 'Keep up the good work',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    status: 'completed',
  },
  { 
    id: '8', 
    sender: 'web3_dev', 
    amount: 0.4, 
    tokenType: 'USDC',
    message: 'Thanks for the tutorial!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), // 6 days ago
    status: 'completed',
  },
  { 
    id: '9', 
    sender: 'crypto_newbie', 
    amount: 0.1, 
    tokenType: 'SOL',
    message: 'Thanks for explaining crypto so clearly!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 7 days ago
    status: 'completed',
  },
  { 
    id: '10', 
    sender: 'longtime_fan', 
    amount: 0.6, 
    tokenType: 'USDC',
    message: 'Been following for years. Thanks for all you do!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(), // 8 days ago
    status: 'completed',
  },
  { 
    id: '11', 
    sender: 'crypto_researcher', 
    amount: 0.75, 
    tokenType: 'USDC',
    message: 'Great analysis on latest trends',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 216).toISOString(), // 9 days ago
    status: 'completed',
  },
  { 
    id: '12', 
    sender: 'chain_enthusiast', 
    amount: 0.35, 
    tokenType: 'USDC',
    message: 'Your blockchain explanations are the best!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(), // 10 days ago
    status: 'completed',
  },
  { 
    id: '13', 
    sender: 'metaverse_explorer', 
    amount: 0.8, 
    tokenType: 'USDC',
    message: 'Thanks for the virtual world tour!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 264).toISOString(), // 11 days ago
    status: 'completed',
  },
  { 
    id: '14', 
    sender: 'dao_voter', 
    amount: 0.45, 
    tokenType: 'USDC',
    message: 'Great governance proposal analysis',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 288).toISOString(), // 12 days ago
    status: 'completed',
  },
  { 
    id: '15', 
    sender: 'crypto_student', 
    amount: 0.15, 
    tokenType: 'USDC',
    message: 'Your lessons are helping me so much!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 336).toISOString(), // 14 days ago
    status: 'completed',
  },
  { 
    id: '16', 
    sender: 'old_school_hodl', 
    amount: 1.0, 
    tokenType: 'USDC',
    message: 'Been in crypto since 2013. Great content!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 384).toISOString(), // 16 days ago
    status: 'completed',
  },
  { 
    id: '17', 
    sender: 'nft_artist', 
    amount: 0.7, 
    tokenType: 'SOL',
    message: 'Thank you for featuring my artwork!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 432).toISOString(), // 18 days ago
    status: 'completed',
  },
];

// Original analytics data
const originalAnalyticsData = {
  totalTips: 27,
  totalValue: 8.45,
  avgTipValue: 0.31,
  topToken: 'USDC',
  weeklyGrowth: 12, // percentage
  monthlyVolume: [1.2, 0.8, 1.5, 0.7, 0.9, 2.1, 1.8], // last 7 days
};

export function Dashboard() {
  const [copied, setCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const tipLink = 'https://tiplink.io/johndoe';
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [allTips, setAllTips] = React.useState(originalTips);
  const [visibleTips, setVisibleTips] = React.useState(originalTips.slice(0, 5));
  const [analyticsData, setAnalyticsData] = React.useState(originalAnalyticsData);
  
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
    
    // Apply filters after a short delay (simulating API call)
    setTimeout(() => {
      applyFilters(newFilters);
      setIsLoading(false);
    }, 500);
  };

  // Apply filters to data
  const applyFilters = (appliedFilters: DataFilterType) => {
    // Filter transactions
    let filteredTips = [...originalTips];
    
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
    
    // Apply date range filters
    if (appliedFilters.startDate) {
      const startDate = new Date(appliedFilters.startDate);
      filteredTips = filteredTips.filter(tip => new Date(tip.timestamp) >= startDate);
    }
    
    if (appliedFilters.endDate) {
      const endDate = new Date(appliedFilters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filteredTips = filteredTips.filter(tip => new Date(tip.timestamp) <= endDate);
    }
    
    // Apply amount filters
    if (appliedFilters.minAmount !== undefined) {
      filteredTips = filteredTips.filter(tip => tip.amount >= appliedFilters.minAmount!);
    }
    
    if (appliedFilters.maxAmount !== undefined) {
      filteredTips = filteredTips.filter(tip => tip.amount <= appliedFilters.maxAmount!);
    }
    
    // Apply currency filter
    if (appliedFilters.currency) {
      filteredTips = filteredTips.filter(tip => tip.tokenType === appliedFilters.currency);
    }
    
    // Apply sorting
    if (appliedFilters.sortBy) {
      filteredTips.sort((a, b) => {
        const key = appliedFilters.sortBy!;
        const aValue = a[key as keyof typeof a];
        const bValue = b[key as keyof typeof b];
        
        if (aValue < bValue) {
          return appliedFilters.sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return appliedFilters.sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Update the tips list with filtered results
    setAllTips(filteredTips);
    setVisibleTips(filteredTips.slice(0, 5));
    
    // Update the analytics data based on filtered tips
    updateAnalyticsData(filteredTips);
  };
  
  // Update analytics data based on filtered tips
  const updateAnalyticsData = (filteredTips: typeof originalTips) => {
    if (filteredTips.length === 0) {
      // If no tips match filter, show zeros
      setAnalyticsData({
        ...originalAnalyticsData,
        totalTips: 0,
        totalValue: 0,
        avgTipValue: 0
      });
      return;
    }
    
    // Calculate new values based on filtered tips
    const totalValue = filteredTips.reduce((sum, tip) => sum + tip.amount, 0);
    const avgTipValue = totalValue / filteredTips.length;
    
    // Count tips by token type to find top token
    const tokenCounts = filteredTips.reduce((acc, tip) => {
      acc[tip.tokenType] = (acc[tip.tokenType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Find the token with the most tips
    let topToken = 'USDC';
    let maxCount = 0;
    
    Object.entries(tokenCounts).forEach(([token, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topToken = token;
      }
    });
    
    // Calculate weekly volume (last 7 days)
    const now = new Date();
    const weeklyVolume = Array(7).fill(0);
    
    filteredTips.forEach(tip => {
      const tipDate = new Date(tip.timestamp);
      const diffDays = Math.floor((now.getTime() - tipDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        weeklyVolume[diffDays] += tip.amount;
      }
    });
    
    // Reverse the array so the oldest day comes first
    weeklyVolume.reverse();
    
    // Calculate weekly growth
    const thisWeekTotal = weeklyVolume.slice(0, 3).reduce((sum, day) => sum + day, 0);
    const lastWeekTotal = weeklyVolume.slice(4, 7).reduce((sum, day) => sum + day, 0);
    const weeklyGrowth = lastWeekTotal > 0 
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) 
      : 0;
    
    // Update analytics data with new calculated values
    setAnalyticsData({
      totalTips: filteredTips.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      avgTipValue: parseFloat(avgTipValue.toFixed(2)),
      topToken,
      weeklyGrowth,
      monthlyVolume: weeklyVolume
    });
  };

  // Format weekly chart data
  const getWeeklyChartData = (): ChartData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return analyticsData.monthlyVolume.map((value, index) => ({
      value,
      label: days[index % days.length],
      secondaryValue: `$${value.toFixed(2)} USDC`
    }));
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
    const defaultFilters = {
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
    applyFilters(defaultFilters);
  };

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Replace the LoggedInNav with our new SidebarNav */}
      <SidebarNav username="johndoe.eth" />

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
            value={analyticsData.totalValue}
            prefix="$"
            suffix=" USDC"
            loading={isLoading}
            icon={<DollarOutlined />}
          />
          
          <MetricCard
            title="Total Tips"
            value={analyticsData.totalTips}
            loading={isLoading}
            icon={<UserOutlined />}
          />
          
          <MetricCard
            title="Weekly Growth"
            value={analyticsData.weeklyGrowth}
            prefix={analyticsData.weeklyGrowth >= 0 ? "+" : ""}
            suffix="%"
            loading={isLoading}
            icon={<RiseOutlined />}
            iconBgClassName={analyticsData.weeklyGrowth >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
          />
          
          <MetricCard
            title="Avg. Tip Value"
            value={analyticsData.avgTipValue}
            prefix="$"
            suffix=" USDC"
            loading={isLoading}
            icon={<LineChartOutlined />}
          />
        </motion.div>
        
        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Your TipLink"
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
                        status="completed"
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
                
                {visibleTips.length > 0 && allTips.length > visibleTips.length && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline"
                      onClick={() => setVisibleTips(allTips.slice(0, visibleTips.length + 5))}
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
                <Input label="Display Name" defaultValue="John Doe" />
                <Input label="Username" defaultValue="johndoe" />
                <Input label="Wallet Address" defaultValue="0x1a2...3b4c" readOnly />
                <Textarea label="Bio" defaultValue="Web3 creator and developer building in the Solana ecosystem." />
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