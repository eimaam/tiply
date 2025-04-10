import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion } from 'framer-motion'
import { smoothScrollTo } from '@/lib/utils'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
  };

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-background/80 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-brand-primary">
            TipLink
          </Link>
        </div>
        
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-sm text-brand-foreground hover:text-brand-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/t/demo"
            className="text-sm text-brand-foreground hover:text-brand-primary transition-colors"
          >
            Start Tipping
          </Link>
          <Link
            to="/contact"
            className="text-sm text-brand-foreground hover:text-brand-primary transition-colors"
          >
            Contact
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}