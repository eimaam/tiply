import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserOutlined, LinkOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons'

// Multi-step onboarding process
const steps = [
  { id: 'profile', title: 'Profile Details' },
  { id: 'wallet', title: 'Connect Wallet' },
  { id: 'customize', title: 'Customize Link' },
]

export function Onboarding() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [profileData, setProfileData] = React.useState({
    username: '',
    displayName: '',
    bio: '',
    profileImage: '',
  })
  const [walletConnected, setWalletConnected] = React.useState(false)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const connectWallet = () => {
    setLoading(true)
    // Simulate wallet connection
    setTimeout(() => {
      setLoading(false)
      setWalletConnected(true)
    }, 1500)
  }

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate profile setup
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 2000)
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
    <div className="min-h-screen bg-brand-background py-12">
      <motion.div 
        className="container max-w-2xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Set up your TipLink</h1>
              <p className="text-brand-muted-foreground mt-1">
                Complete these steps to start accepting tips
              </p>
            </div>
            <div className="text-brand-primary text-xl font-semibold">
              {currentStep + 1}/{steps.length}
            </div>
          </div>
          
          <div className="flex justify-between mb-8 relative">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex flex-col items-center relative z-10 ${index < currentStep ? 'text-brand-primary' : index === currentStep ? 'text-brand-foreground' : 'text-brand-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index < currentStep 
                    ? 'bg-brand-primary text-white' 
                    : index === currentStep 
                      ? 'bg-brand-primary/20 text-brand-primary border-2 border-brand-primary' 
                      : 'bg-brand-surface border-2 border-brand-border'
                }`}>
                  {index < currentStep ? (
                    <CheckCircleOutlined />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
            
            {/* Progress bar */}
            <div className="absolute top-5 left-0 h-0.5 bg-brand-border w-full -z-0"></div>
            <div 
              className="absolute top-5 left-0 h-0.5 bg-brand-primary -z-0" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-brand-surface rounded-xl border border-brand-border p-8"
        >
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Details</h2>
              <p className="text-brand-muted-foreground">
                Tell us a bit about yourself so your supporters can recognize you
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-brand-muted-foreground">
                      <UserOutlined />
                    </div>
                    <Input 
                      name="username"
                      placeholder="yourcoolname"
                      className="pl-10"
                      value={profileData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-brand-muted-foreground">
                    Your unique TipLink URL: tiplink.io/<span className="text-brand-primary">{profileData.username || 'yourcoolname'}</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input 
                    name="displayName"
                    placeholder="Your Name or Creator Name"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    name="bio"
                    placeholder="Tell your supporters what you do and why they should tip you"
                    value={profileData.bio}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Image URL</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-brand-muted-foreground">
                      <LinkOutlined />
                    </div>
                    <Input
                      name="profileImage"
                      type="url"
                      placeholder="https://example.com/your-image.jpg"
                      className="pl-10"
                      value={profileData.profileImage}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
              <p className="text-brand-muted-foreground">
                Connect a wallet to receive tips directly. All tips will be sent to this wallet.
              </p>
              
              <div className="bg-brand-background rounded-lg p-6 border border-brand-border">
                {!walletConnected ? (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-brand-primary/10 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                      <WalletIcon className="w-12 h-12 text-brand-primary" />
                    </div>
                    <h3 className="font-medium">No Wallet Connected</h3>
                    <p className="text-sm text-brand-muted-foreground">
                      Connect your wallet to start receiving tips directly to your wallet
                    </p>
                    <Button onClick={connectWallet} loading={loading} className="w-full">
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-green-500/10 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                      <CheckCircleOutlined className="text-4xl text-green-500" />
                    </div>
                    <h3 className="font-medium">Wallet Connected!</h3>
                    <div className="px-4 py-2 bg-brand-surface border border-brand-border rounded-md font-mono text-sm">
                      0x1a2...3b4c
                    </div>
                    <p className="text-sm text-brand-muted-foreground">
                      Tips will be sent directly to this address
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Customize Your TipLink</h2>
              <p className="text-brand-muted-foreground">
                Configure token options and customize your TipLink page
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Token</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-brand-primary p-3 rounded-lg flex items-center space-x-3 bg-brand-primary/10">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">$</div>
                      <span>USDC</span>
                    </div>
                    <div className="border border-brand-border p-3 rounded-lg flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
                      <span>SOL</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Suggested Amounts</label>
                  <div className="grid grid-cols-4 gap-2">
                    <Input defaultValue="1" className="text-center" />
                    <Input defaultValue="5" className="text-center" />
                    <Input defaultValue="10" className="text-center" />
                    <Input defaultValue="25" className="text-center" />
                  </div>
                  <p className="text-xs text-brand-muted-foreground">
                    These will appear as quick options for your supporters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme Color</label>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg border-2 border-white"></div>
                    <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
                    <div className="w-10 h-10 bg-green-500 rounded-lg"></div>
                    <div className="w-10 h-10 bg-pink-500 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousStep} 
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button onClick={handleNextStep} loading={loading}>
              {currentStep === steps.length - 1 ? 'Finish Setup' : 'Continue'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Simple wallet icon component
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      className={className}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5}
        d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12v7.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 19.5V12z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5}
        d="M16.5 12h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75a.75.75 0 01.75-.75z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5}
        d="M4.5 9.75v-.75A3.75 3.75 0 018.25 5h11.25"
      />
    </svg>
  )
}