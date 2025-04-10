import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { smoothScrollTo } from '@/lib/utils'
import PoweredBySolanaIllustration from '@/assets/images/illustrations/powered-by-solana'

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
  // Function to handle smooth scrolling to the How It Works section
  const scrollToHowItWorks = () => {
    smoothScrollTo('how-it-works');
  };

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
            <span className="text-brand-primary">Support Creators</span> or <span className="text-brand-primary">Get Tipped</span> — Instantly ⚡
          </motion.h1>
          
          <motion.p 
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted-foreground"
          >
            Just a link. No logins. Creators get paid in <b>USDC</b> 💰. Supporters give effortlessly. 
            <span className="block mt-2">It's tipping without the friction — powered by Solana.</span>
          </motion.p>
          
          <motion.div 
            variants={item}
            className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-center gap-x-6"
          >
            <Link to="/signup">
              <Button size="lg">Create Your TippLink</Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToHowItWorks}
            >
              See How It Works
            </Button>
          </motion.div>
          
          <motion.div
            variants={item}
            className="mt-16 flex justify-center"
          >
            <a 
              href="https://solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <PoweredBySolanaIllustration />
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.primary/0.1),transparent)]" />
    </div>
  )
}