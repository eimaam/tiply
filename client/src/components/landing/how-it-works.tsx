import * as React from 'react'
import { motion } from 'framer-motion'
import { WalletOutlined, ShareAltOutlined, DollarOutlined } from '@ant-design/icons'

const steps = [
  {
    title: 'Create a tip link',
    description: 'Sign in with your wallet and claim your username.',
    icon: WalletOutlined,
  },
  {
    title: 'Share Your Link',
    description: 'Add it to your bio, posts, or messages.',
    icon: ShareAltOutlined,
  },
  {
    title: 'Receive Tips',
    description: 'Get USDC instantly from your supporters.',
    icon: DollarOutlined,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-brand-foreground sm:text-4xl">
            How It Works 🛠️
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-muted-foreground">
            Start accepting tips in three simple steps
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24"
        >
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={item}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-brand-foreground">
                  {index === 0 ? `${step.title} 🔗` : 
                   index === 1 ? `${step.title} 📱` : 
                   index === 2 ? `${step.title} 💸` : 
                   step.title}
                </h3>
                <p className="mt-2 text-brand-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}