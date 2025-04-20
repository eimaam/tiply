import * as React from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  MailOutlined, 
  CustomerServiceOutlined, 
  TwitterOutlined, 
  GithubOutlined, 
  SendOutlined
} from '@ant-design/icons'
import { PROJECT_INFO } from '@/lib/utils'

export function ContactPage() {
  const [formState, setFormState] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Reset form after showing success message
      setTimeout(() => {
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />
      
      <main className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
            <p className="text-xl text-brand-muted-foreground mb-8">
              Have questions about tiply? We're here to help!
            </p>
          </motion.div>
          
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              className="bg-brand-surface p-8 rounded-xl ring-1 ring-brand-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-brand-foreground mb-6">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder=""
                    value={formState.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tipper@tiply.xyz"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please describe your question or issue..."
                    className="h-32 resize-none"
                    value={formState.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <Button 
                  htmlType="submit" 
                  className="w-full" 
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? 'Sending...' : isSuccess ? 'Message Sent!' : 'Send Message'} 
                  {!isSubmitting && !isSuccess && <SendOutlined className="ml-2" />}
                </Button>
              </form>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h2 className="text-2xl font-bold text-brand-foreground mb-6">
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-brand-primary bg-opacity-10 p-3 rounded-full">
                      <MailOutlined className="text-brand-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-brand-foreground">
                        Email Us
                      </h3>
                      <p className="text-brand-muted-foreground">
                        support@tiply.xyz
                      </p>
                      <p className="text-brand-muted-foreground">
                        partnerships@tiply.xyz
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-brand-primary bg-opacity-10 p-3 rounded-full">
                      <CustomerServiceOutlined className="text-brand-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-brand-foreground">
                        Support Hours
                      </h3>
                      <p className="text-brand-muted-foreground">
                        Monday - Friday: 8am - 6pm UTC+1
                      </p>
                      <p className="text-brand-muted-foreground">
                        Weekend: 10am - 1pm UTC+1
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-brand-foreground mb-6">
                  Follow Us
                </h2>
                
                <div className="flex space-x-4">
                  <a 
                    href={PROJECT_INFO.twitterUrl as string} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-surface p-3 rounded-full ring-1 ring-brand-border hover:ring-brand-primary transition-colors"
                  >
                    <TwitterOutlined className="text-xl" />
                  </a>
                  
                  <a 
                    href={PROJECT_INFO.repoUrl as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-surface p-3 rounded-full ring-1 ring-brand-border hover:ring-brand-primary transition-colors"
                  >
                    <GithubOutlined className="text-xl" />
                  </a>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-primary to-brand-primary/70 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Premium Support</h3>
                <p className="mb-4">
                  Get priority support with our Premium plan, including 24/7 assistance and personalized guidance.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white hover:text-brand-primary"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </motion.div>
          </div>
          
          {/* FAQ Callout */}
          <motion.div 
            className="mt-16 text-center bg-brand-surface p-8 rounded-xl ring-1 ring-brand-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-brand-foreground mb-4">
              Check our Frequently Asked Questions
            </h2>
            <p className="text-brand-muted-foreground mb-6 max-w-2xl mx-auto">
              Many common questions are answered in our comprehensive FAQ section. It might be the fastest way to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/faq'}
            >
              Browse FAQs
            </Button>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}