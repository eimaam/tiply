import * as React from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { DollarOutlined, SendOutlined, HeartOutlined } from '@ant-design/icons'

// Dummy creator profile data
const creatorProfile = {
  username: 'johndoe',
  displayName: 'John Doe',
  bio: 'Web3 creator and developer building in the Solana ecosystem',
  profileImage: 'https://via.placeholder.com/150',
  acceptedTokens: [
    { symbol: 'USDC', name: 'USD Coin', icon: '$' },
    { symbol: 'SOL', name: 'Solana', icon: 'S' },
  ]
}

// Custom tip amounts
const suggestedAmounts = [1, 5, 10, 25]

export function TipPage() {
  const { username = creatorProfile.username } = useParams()
  const [amount, setAmount] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [selectedToken, setSelectedToken] = React.useState('USDC')
  const [transactionStatus, setTransactionStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTransactionStatus('pending')
    
    // Simulate transaction processing
    setTimeout(() => {
      setLoading(false)
      setTransactionStatus('success')
      
      // Reset form after success
      setTimeout(() => {
        setTransactionStatus('idle')
        setAmount('')
        setMessage('')
      }, 3000)
    }, 2000)
  }
  
  const selectSuggestedAmount = (value: number) => {
    setAmount(value.toString())
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
  
  // Convert token options to the format expected by our new Select component
  const tokenOptions = creatorProfile.acceptedTokens.map(token => ({
    label: (
      <div className="flex items-center">
        <div className={`w-5 h-5 rounded-full ${token.symbol === 'USDC' ? 'bg-green-500' : 'bg-purple-500'} flex items-center justify-center text-xs text-white mr-2`}>
          {token.icon}
        </div>
        <span>{token.name} ({token.symbol})</span>
      </div>
    ),
    value: token.symbol
  }))
  
  if (transactionStatus === 'success') {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center py-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="container max-w-md mx-auto px-4"
        >
          <div className="bg-brand-surface rounded-xl border border-brand-border p-8 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartOutlined className="text-4xl text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Tip Sent!</h1>
            <p className="text-brand-muted-foreground mt-2 mb-6">
              Thank you for supporting {creatorProfile.displayName}
            </p>
            <p className="text-3xl font-bold text-brand-primary mb-6">
              ${amount} <span className="text-sm">{selectedToken}</span>
            </p>
            <Button 
              onClick={() => setTransactionStatus('idle')}
              className="w-full"
            >
              Send Another Tip
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background py-12">
      <motion.div 
        className="container max-w-md mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="bg-brand-surface rounded-xl border border-brand-border p-8">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-brand-primary to-brand-accent overflow-hidden">
                {creatorProfile.profileImage ? (
                  <img src={creatorProfile.profileImage} alt={creatorProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                    {creatorProfile.displayName.charAt(0)}
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold">{creatorProfile.displayName}</h1>
              <p className="text-sm font-medium text-brand-primary">@{username}</p>
              <p className="text-brand-muted-foreground text-sm max-w-xs mx-auto">
                {creatorProfile.bio}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <Select
                  label="Select Token"
                  options={tokenOptions}
                  defaultValue={selectedToken}
                  onChange={(value) => setSelectedToken(value as string)}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-foreground">Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="text-lg"
                    step="0.01"
                    min="0.01"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedAmounts.map(amt => (
                      <Button 
                        key={amt}
                        type="button"
                        variant={parseFloat(amount) === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectSuggestedAmount(amt)}
                        className="flex-1"
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-brand-foreground">Message (Optional)</label>
                  <Textarea
                    placeholder="Add a message to your tip"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full relative group" 
                  size="lg" 
                  loading={loading}
                  disabled={loading || !amount}
                  htmlType="submit"
                >
                  <span className="flex items-center">
                    {loading ? "Processing..." : (
                      <>
                        Send Tip <SendOutlined className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
                
                <p className="text-xs text-center text-brand-muted-foreground mt-4">
                  Tips are sent directly to the creator's wallet.
                  <br />Network fees may apply.
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}