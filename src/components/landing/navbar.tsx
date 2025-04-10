import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion } from 'framer-motion'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#start', label: 'Start Tipping' },
]

export function Navbar() {
  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-background/80 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <a href="/" className="text-xl font-bold text-brand-primary">
            TipLink
          </a>
        </div>
        
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-brand-foreground hover:text-brand-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button>Get Started</Button>
        </div>
      </div>
    </motion.nav>
  )
}