import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckOutlined, RocketOutlined, BellOutlined } from '@ant-design/icons'
import { message } from 'antd'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started with tipping',
    features: [
      'Receive USDC tips',
      'No login tipping',
      'Basic analytics',
      'Standard support',
    ],
  },
  {
    name: 'Pro',
    price: '5',
    description: 'Perfect for creators ready to level up',
    comingSoon: true,
    earlyAdopterText: 'Launching soon — free forever for early adopters!',
    features: [
      'Everything in Free',
      'Custom branding',
      'Advanced analytics',
      'Priority support',
      'Custom domain',
      'API access',
    ],
  },
]

export function Pricing() {
  const [waitlistEmail, setWaitlistEmail] = React.useState<string>('')
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false)

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setWaitlistEmail('')
      setHasSubmitted(true)
      message.success('You\'ve been added to the tiply Pro waitlist!')
    }, 1000)
  }

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-brand-foreground sm:text-4xl">
            Simple, transparent pricing 💎
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-muted-foreground">
            Choose the plan that works best for you
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl bg-brand-surface p-8 ring-1 ${plan.comingSoon ? 'ring-brand-primary/30 relative overflow-hidden' : 'ring-brand-border'} xl:p-10`}
            >
              {plan.comingSoon && (
                <div className="absolute right-0 top-0">
                  <div className="bg-brand-primary text-white text-xs px-4 py-1 font-medium transform rotate-45 translate-x-7 translate-y-3">
                    COMING SOON
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-brand-foreground">
                    {plan.name === 'Free' ? `${plan.name} 🌱` : `${plan.name} ⭐️`}
                  </h3>
                  {plan.comingSoon && (
                    <span className="inline-flex items-center rounded-md bg-brand-primary/10 px-2 py-1 text-xs font-medium text-brand-primary">
                      Beta
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-brand-muted-foreground">
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-brand-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-brand-muted-foreground">
                    /month
                  </span>
                </p>
                {plan.earlyAdopterText && (
                  <p className="mt-2 text-sm text-brand-primary font-medium flex items-center">
                    <RocketOutlined className="mr-1" />
                    {plan.earlyAdopterText}
                  </p>
                )}
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-brand-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckOutlined className="h-6 w-5 flex-none text-brand-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {plan.comingSoon ? (
                <div className="w-full mt-8">
                  <p className="mb-3 text-sm font-medium flex items-center text-brand-primary">
                    <BellOutlined className="mr-1" />
                    Want early access to tiply Pro? Join the waitlist 👇
                  </p>
                  {!hasSubmitted ? (
                    <form onSubmit={handleWaitlistSubmit} className="space-y-3 w-full">
                      <div className="!w-full flex gap-3">
                        <Input
                          type="email"
                          placeholder="Your email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          required
                          className="!w-full"
                        />
                        <Button 
                          htmlType="submit" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-brand-muted-foreground">Thanks! We'll notify you when tiply Pro launches.</p>
                  )}
                </div>
              ) : (
                <Link to={`/signup?plan=${plan.name.toLowerCase()}`}>
                  <Button
                    variant={plan.name === 'Pro' ? 'default' : 'outline'}
                    className="mt-8 w-full"
                    size="lg"
                  >
                    Get {plan.name}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}