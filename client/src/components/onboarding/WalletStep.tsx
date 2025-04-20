import * as React from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { WalletOutlined, CheckCircleOutlined, InfoCircleOutlined, MailOutlined } from '@ant-design/icons'
import { OnboardingHeading } from './OnboardingHeading';
import { Radio } from 'antd';

// Import Solana UI components
import PoweredBySolana from '@/assets/images/illustrations/powered-by-solana';

interface WalletStepProps {
  walletConnected: boolean;
  walletAddress: string;
  onWalletAddressChange: (walletAddress: string) => void;
  onConnect: (connected: boolean, address: string) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onNext: () => void;
  onPrevious: () => void;
}

// Wallet provider types
type WalletProvider = {
  name: string
  icon: string
  bgColor: string
}

export function WalletStep({ 
  walletAddress, 
  onWalletAddressChange, 
  loading,
  onConnect,
  onNext, 
  onPrevious 
}: WalletStepProps) {
  const [isValid, setIsValid] = React.useState(true)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectingProvider, setConnectingProvider] = React.useState<string | null>(null)
  const [showEmailOption, setShowEmailOption] = React.useState(false)
  const [method, setMethod] = React.useState<'auto' | 'custom'>('auto');
  
  // Available wallet providers
  const walletProviders: WalletProvider[] = [
    {
      name: 'Phantom',
      icon: '👻',
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-700'
    },
    {
      name: 'Solflare',
      icon: '☀️',
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-700'
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-700'
    }
  ]
  
  // Check if we can proceed to next step
  const canContinue = walletAddress && isValid && !isConnecting
  
  // Handle input change and validate
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Basic Solana wallet address validation - checks for proper length and format
    const valid = value === '' || (value.length === 44)
    setIsValid(valid)
    
    onWalletAddressChange(value)
  }
  
  // Connect wallet handler
  const handleConnectWallet = (providerName: string) => {
    setIsConnecting(true)
    setConnectingProvider(providerName)
    
    // Simulate wallet connection
    setTimeout(() => {
      const simulatedAddress = 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2'
      onWalletAddressChange(simulatedAddress)
      setIsConnecting(false)
      setConnectingProvider(null)
      onConnect(true, simulatedAddress)
    }, 1500)
  }

  // Email wallet handler
  const handleEmailWallet = () => {
    setShowEmailOption(true)
  }

  return (
    <div className="space-y-6">
      <OnboardingHeading
        title="Wallet Setup"
        subtitle="Choose how to receive your tips"
      />
      <div>
        <label className="block text-sm font-medium mb-2">Tip Storage Method</label>
        <Radio.Group
          onChange={e => setMethod(e.target.value)}
          value={method}
        >
          <Radio.Button value="auto">Auto-generated Wallet (Default)</Radio.Button>
          <Radio.Button value="custom">Connect/Enter Wallet</Radio.Button>
        </Radio.Group>
      </div>
      {method === 'auto' ? (
        <div className="p-4 bg-brand-surface border border-brand-border rounded-lg">
          <p className="text-sm text-brand-muted-foreground">
            We've created a secure wallet for you behind the scenes. All tips will be stored there until you're ready to withdraw.
          </p>
          <Button onClick={onNext} className="mt-4">
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wallet providers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {walletProviders.map((provider) => (
              <motion.div
                key={provider.name}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => handleConnectWallet(provider.name)}
                  disabled={isConnecting}
                  variant="ghost"
                  className={`w-full py-5 ${provider.bgColor} text-white h-auto flex flex-col items-center justify-center gap-2`}
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-medium">{provider.name}</span>
                  {isConnecting && connectingProvider === provider.name && (
                    <span className="text-xs animate-pulse">Connecting...</span>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink mx-4 text-xs text-brand-muted-foreground">OR</span>
            <div className="flex-grow border-t border-brand-border"></div>
          </div>
          
          {/* Email option */}
          {!showEmailOption ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button 
                onClick={handleEmailWallet}
                variant="outline"
                className="w-full py-4 border-dashed"
              >
                <MailOutlined className="mr-2" />
                Continue with Email (Solana Pay)
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4 p-4 border border-brand-border rounded-lg">
              <h3 className="text-sm font-medium">Continue with Email</h3>
              <Input
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
              <Button
                onClick={() => {
                  setTimeout(() => {
                    const simulatedAddress = 'EmailWallet1234...5678'
                    onWalletAddressChange(simulatedAddress)
                  }, 1000)
                }}
                className="w-full"
              >
                Send Magic Link
              </Button>
            </div>
          )}

          {/* Manual entry option */}
          <div className="mt-4 pt-4 border-t border-brand-border">
            <label className="block text-sm font-medium text-brand-muted-foreground mb-2">
              Or enter your wallet address manually:
            </label>
            <Input 
              name="walletAddress"
              placeholder="Your Solana wallet address"
              prefixIcon={<WalletOutlined />}
              value={walletAddress}
              onChange={handleChange}
              className={`text-sm font-mono ${!isValid ? 'border-red-500' : walletAddress ? 'border-green-500' : ''}`}
            />
            
            {/* Validation feedback */}
            {!isValid && walletAddress && (
              <p className="mt-2 text-sm text-red-500">
                Please enter a valid Solana wallet address
              </p>
            )}
            
            {isValid && walletAddress && (
              <p className="mt-2 text-sm text-green-500 flex items-center">
                <CheckCircleOutlined className="mr-1" /> Valid wallet address
              </p>
            )}
          </div>
          
          {/* Info note */}
          <div className="flex items-start space-x-2 p-3 bg-brand-primary/5 rounded-lg text-sm text-brand-muted-foreground">
            <InfoCircleOutlined className="text-brand-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-brand-foreground">Why connect a wallet?</p>
              <p>Tips will be sent directly to this wallet address. Your wallet is only used for receiving payments and can be updated later in settings.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}