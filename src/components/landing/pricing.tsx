import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckOutlined } from '@ant-design/icons'

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
    name: 'Premium',
    price: '9',
    description: 'Advanced features for serious creators',
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
            Simple, transparent pricing
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
              className="flex flex-col justify-between rounded-3xl bg-brand-surface p-8 ring-1 ring-brand-border xl:p-10"
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-brand-foreground">
                    {plan.name}
                  </h3>
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
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-brand-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckOutlined className="h-6 w-5 flex-none text-brand-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={plan.name === 'Premium' ? 'default' : 'outline'}
                className="mt-8"
                size="lg"
              >
                Get {plan.name}
              </Button>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}