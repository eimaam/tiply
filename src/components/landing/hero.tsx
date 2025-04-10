import * as React from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

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

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div
          className="text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            variants={item}
            className="text-4xl font-bold tracking-tight text-brand-foreground sm:text-6xl"
          >
            Send Tips. No Logins.
            <span className="text-brand-primary"> Just a Link.</span>
          </motion.h1>
          
          <motion.p 
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted-foreground"
          >
            Empower your audience to support you in seconds. Built on Solana. Paid in USDC.
          </motion.p>
          
          <motion.div 
            variants={item}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button size="lg">Start Tipping</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.primary/0.1),transparent)]" />
    </div>
  )
}