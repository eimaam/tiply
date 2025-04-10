import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarOutlined,
  PercentageOutlined,
  MessageOutlined,
  ShareAltOutlined,
  LineChartOutlined
} from '@ant-design/icons'

const features = [
  {
    name: 'No-login tipping',
    description: 'No registration needed for users. Just connect a wallet and send.',
    icon: DollarOutlined,
  },
  {
    name: 'Platform fee only 1%',
    description: 'Keep more of your tips with our transparent, low-cost fee structure.',
    icon: PercentageOutlined,
  },
  {
    name: 'Optional tip notes',
    description: 'Let supporters share messages of encouragement with their tips.',
    icon: MessageOutlined,
  },
  {
    name: 'Social preview support',
    description: 'Rich previews on Twitter, Discord, and Instagram.',
    icon: ShareAltOutlined,
  },
  {
    name: 'Premium analytics',
    description: 'Track your earnings and supporter engagement with detailed insights.',
    icon: LineChartOutlined,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Features() {
  return (
    <div id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-brand-foreground sm:text-4xl">
            Everything you need to start accepting tips
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-muted-foreground">
            Simple, fast, and secure. Start receiving support from your audience today.
          </p>
        </motion.div>
        
        <motion.div 
          className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24 lg:max-w-none"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div 
                key={feature.name}
                variants={item}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-brand-foreground">
                  <feature.icon className="h-5 w-5 flex-none text-brand-primary" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-brand-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  )
}