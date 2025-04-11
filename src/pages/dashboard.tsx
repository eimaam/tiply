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
  CheckCircleOutlined
} from '@ant-design/icons'
import { SidebarNav } from '@/components/ui/sidebar-nav'

// Dummy data for recent tips
const recentTips = [
  { 
    id: '1', 
    sender: 'alex.eth', 
    amount: 0.05, 
    tokenType: 'USDC',
    message: 'Love your content! Keep it up!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  { 
    id: '2', 
    sender: 'crypto_whale.sol', 
    amount: 0.5, 
    tokenType: 'USDC',
    message: 'Great insights on the latest project',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  { 
    id: '3', 
    sender: 'web3_enthusiast', 
    amount: 0.1, 
    tokenType: 'USDC',
    message: 'Thanks for the help yesterday',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
]

// Analytics dummy data
const analyticsData = {
  totalTips: 27,
  totalValue: 5.75,
  avgTipValue: 0.21,
  topToken: 'USDC',
  weeklyGrowth: 12, // percentage
  monthlyVolume: [1.2, 0.8, 1.5, 0.7, 0.9, 2.1, 1.8], // last 7 days
}

export function Dashboard() {
  const [copied, setCopied] = React.useState(false)
  const tipLink = 'https://tiplink.io/johndoe'
  const [activeTab, setActiveTab] = React.useState('dashboard')
  
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const days = Math.floor(diff / 1000 / 60 / 60 / 24)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tipLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

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
        {/* Top Stats Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-brand-muted-foreground">Total Earnings</h3>
                <p className="text-3xl font-bold mt-2">${analyticsData.totalValue} <span className="text-sm text-brand-muted-foreground">USDC</span></p>
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
                <p className="text-3xl font-bold mt-2">{analyticsData.totalTips}</p>
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
                <p className="text-3xl font-bold mt-2 text-green-500">+{analyticsData.weeklyGrowth}%</p>
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
                <p className="text-3xl font-bold mt-2">${analyticsData.avgTipValue} <span className="text-sm text-brand-muted-foreground">USDC</span></p>
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
                {recentTips.length > 0 ? (
                  recentTips.map(tip => (
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
                    <p className="text-brand-muted-foreground">No tips received yet</p>
                    <Button variant="default" className="mt-4">
                      Share your TipLink
                    </Button>
                  </div>
                )}
              </div>
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}