import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'

export function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate signup process
    setTimeout(() => {
      setLoading(false)
      navigate('/onboarding')
    }, 1500)
  }

  const handleWalletConnect = async () => {
    setConnectingWallet(true)
    // Simulate wallet connection
    setTimeout(() => {
      setConnectingWallet(false)
      navigate('/onboarding')
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
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 bg-brand-surface rounded-xl border border-brand-border"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="space-y-2 text-center">
          <div className="bg-gradient-to-br from-brand-primary to-brand-accent p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <WalletOutlined className="text-2xl text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Join TipLink</h1>
          <p className="text-brand-muted-foreground">Create an account to start receiving tips</p>
        </motion.div>

        {/* <motion.div variants={itemVariants} className="flex flex-col space-y-4">
          <Button 
            variant="outline"
            className="border-2 border-brand-border p-6"
            onClick={handleWalletConnect}
            loading={connectingWallet}
          >
            <div className="flex items-center justify-center w-full">
              <div className="bg-brand-primary/10 p-2 rounded-full mr-3">
                <WalletOutlined className="text-brand-primary text-lg" />
              </div>
              <span>Connect Wallet & Sign Up</span>
            </div>
          </Button>
          
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink mx-4 text-sm text-brand-muted-foreground">or register with email</span>
            <div className="flex-grow border-t border-brand-border"></div>
          </div>
        </motion.div> */}

        <motion.form 
          variants={itemVariants}
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email"
              placeholder="name@example.com"
              prefixIcon={<MailOutlined />}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Must be at least 8 characters"
              prefixIcon={<LockOutlined />}
              required
              minLength={8}
            />
          </div>
          
          <Button 
            htmlType="submit" 
            className="w-full" 
            size="lg"
            loading={loading}
          >
            Create Account
          </Button>
          
          <p className="text-xs text-center text-brand-muted-foreground">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-brand-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-brand-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.form>

        <motion.div variants={itemVariants} className="text-center text-sm">
          <p className="text-brand-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}