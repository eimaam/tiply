import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [connectingWallet, setConnectingWallet] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate login process
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1500)
  }

  const handleWalletConnect = async () => {
    setConnectingWallet(true)
    // Simulate wallet connection
    setTimeout(() => {
      setConnectingWallet(false)
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
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <motion.div 
        className="w-full max-w-md p-8 space-y-8 bg-brand-surface rounded-xl border border-brand-border"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="space-y-2 text-center">
          <div className="bg-gradient-to-br from-brand-primary to-brand-accent p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <WalletOutlined className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to TipLink</h1>
          <p className="text-brand-muted-foreground">Access your account to manage your tips</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col space-y-4">
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
              <span>Connect Wallet</span>
            </div>
          </Button>
          
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink mx-4 text-sm text-brand-muted-foreground">or continue with email</span>
            <div className="flex-grow border-t border-brand-border"></div>
          </div>
        </motion.div>

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
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              prefixIcon={<LockOutlined />}
              required
            />
          </div>
          
          <Button 
            htmlType="submit" 
            className="w-full" 
            size="lg"
            loading={loading}
          >
            Sign In
          </Button>
        </motion.form>

        <motion.div variants={itemVariants} className="text-center text-sm">
          <p className="text-brand-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-primary font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}