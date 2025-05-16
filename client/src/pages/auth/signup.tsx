import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form, message } from 'antd'
import { useUser } from '@/contexts/UserContext'

export function SignUp() {
  const { register } = useUser()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [form] = Form.useForm()
  
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

  const handleSubmit = async (values: any) => {
      // Validate passwords match
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match')
        return
      }

      try {
        setIsLoading(true)
        await register({
          email: values.email,
          password: values.password,
          username: values.email.split('@')[0], // Use part of email as temporary username
        })
        
      } catch (error) {
        console.error('Registration error:', error)
        message.error('Registration failed. Please try again.')
      } finally {
        setIsLoading(false)
      }

      
      // Note: No need to handle navigation manually
      // The UserContext register function will handle it
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
            <UserOutlined className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your tiply account</h1>
          <p className="text-brand-muted-foreground">Start receiving tips in minutes</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <Form.Item 
              name="email" 
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  placeholder="name@example.com"
                  prefixIcon={<MailOutlined />}
                />
              </div>
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  prefixIcon={<LockOutlined />}
                />
              </div>
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  prefixIcon={<LockOutlined />}
                />
              </div>
            </Form.Item>
            
            <Button 
              htmlType="submit"
              className="w-full" 
              size="lg"
              loading={isLoading}
            >
              Create Account
            </Button>
          </Form>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center text-sm">
          <p className="text-brand-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-xs text-center text-brand-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-brand-primary hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link>
        </motion.div>
      </motion.div>
    </div>
  )
}