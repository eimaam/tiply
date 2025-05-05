import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form } from 'antd'
import { useUser } from '@/contexts/UserContext'

export function Login() {
  const { login } = useUser()
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
    try {
      setIsLoading(true)
      await login({
        email: values.email,
        password: values.password
      })
    } catch (error) {
      console.error('Login failed:', error)
      form.setFields([
        {
          name: 'email',
          errors: ['Invalid email or password']
        }
      ])
    }
    finally {
      setIsLoading(false)
    }
    
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
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-brand-muted-foreground">Sign in to your tiply account</p>
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
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  prefixIcon={<LockOutlined />}
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-brand-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </Form.Item>
            
            <Button 
              htmlType="submit"
              className="w-full" 
              size="lg"
              loading={isLoading}
            >
              Sign In
            </Button>
          </Form>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center text-sm">
          <p className="text-brand-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-primary font-medium hover:underline">
              Create account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}