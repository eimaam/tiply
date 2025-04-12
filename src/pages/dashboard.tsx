import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
} from '@ant-design/icons'
import { SidebarNav } from '@/components/ui/sidebar-nav'
import DataFilter from '@/components/ui/filters/DataFilter'
import { DataFilter as DataFilterType } from '@/lib/types/filters'
import { CurrencyType, TransactionStatus, TransactionType } from '@/lib/types/transaction'

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
        <motion.div variants={itemVariants} className="mb-8 bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Dashboard Filters</h2>
            {!USER_IS_PREMIUM && (
              <a href="/pricing" className="text-sm text-brand-primary hover:underline flex items-center">
                <FilterOutlined className="mr-1" /> Upgrade for advanced filters
              </a>
            )}
          </div>
          
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
        </motion.div>

        {/* Top Stats Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-brand-muted-foreground">Total Earnings</h3>
                {isLoading ? (
                  <div className="h-8 w-24 bg-brand-border/30 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold mt-2">${analyticsData.totalValue} <span className="text-sm text-brand-muted-foreground">USDC</span></p>
                )}
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full">
                <DollarOutlined className="text-brand-primary text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-brand-muted-foreground">Total Tips</h3>
                {isLoading ? (
                  <div className="h-8 w-16 bg-brand-border/30 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold mt-2">{analyticsData.totalTips}</p>
                )}
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full">
                <UserOutlined className="text-brand-primary text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-brand-muted-foreground">Weekly Growth</h3>
                {isLoading ? (
                  <div className="h-8 w-20 bg-brand-border/30 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className={`text-3xl font-bold mt-2 ${analyticsData.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analyticsData.weeklyGrowth >= 0 ? '+' : ''}{analyticsData.weeklyGrowth}%
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <RiseOutlined className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-brand-muted-foreground">Avg. Tip Value</h3>
                {isLoading ? (
                  <div className="h-8 w-20 bg-brand-border/30 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold mt-2">${analyticsData.avgTipValue} <span className="text-sm text-brand-muted-foreground">USDC</span></p>
                )}
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full">
                <LineChartOutlined className="text-brand-primary text-xl" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-xl border border-brand-border p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 rounded-full blur-3xl"></div>
              
              <h2 className="text-2xl font-semibold mb-4">Your TipLink</h2>
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
            </motion.div>

            <motion.div variants={itemVariants} className="bg-brand-surface rounded-xl border border-brand-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Recent Tips</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
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
                    <div 
                      key={tip.id} 
                      className="p-4 rounded-lg border border-brand-border hover:border-brand-primary/50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{tip.sender}</p>
                          <p className="text-sm text-brand-muted-foreground mt-1">{tip.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-brand-primary">${tip.amount.toFixed(2)} <span className="text-xs">{tip.tokenType}</span></p>
                          <p className="text-xs text-brand-muted-foreground mt-1 flex items-center justify-end">
                            <ClockCircleOutlined className="mr-1" />
                            {formatRelativeTime(tip.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
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
            </motion.div>
          </div>
          
          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Profile Settings</h2>
                <SettingOutlined className="text-brand-muted-foreground" />
              </div>
              <form className="space-y-4">
                <Input label="Display Name" defaultValue="John Doe" />
                <Input label="Username" defaultValue="johndoe" />
                <Input label="Wallet Address" defaultValue="0x1a2...3b4c" readOnly />
                <Textarea label="Bio" defaultValue="Web3 creator and developer building in the Solana ecosystem." />
                <Button className="w-full">Save Changes</Button>
              </form>
            </div>

            <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
              <h2 className="text-xl font-semibold mb-4">Token Preferences</h2>
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
            </div>
            
            {/* Weekly Volume Chart */}
            <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
              <h2 className="text-xl font-semibold mb-4">Weekly Volume</h2>
              {isLoading ? (
                <div className="h-40 w-full bg-brand-border/30 rounded animate-pulse"></div>
              ) : (
                <div className="h-40">
                  <div className="w-full h-full flex items-end justify-between px-2 border-b border-l border-brand-border">
                    {analyticsData.monthlyVolume.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-6 bg-brand-primary rounded-t-md"
                          style={{ height: `${Math.max((day/Math.max(...analyticsData.monthlyVolume))*100, 5)}%` }}
                        ></div>
                        <div className="mt-2 text-xs text-brand-muted-foreground">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}