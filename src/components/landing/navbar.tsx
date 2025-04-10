import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion, AnimatePresence } from 'framer-motion'
import { smoothScrollTo } from '@/lib/utils'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import logo from '@/assets/images/tipp-link-logo.png'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
    setMobileMenuOpen(false); 
  };

  // Handle clicks outside the mobile menu to close it
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Disable scrolling when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-background/80 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x">
            <img src={logo} alt="Tipp Link Logo" className="h-8 md:h-12 w-auto" />
            <span className="text-xl font-bold text-brand-primary">TipLink</span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
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
        
        {/* Right side items (theme toggle and signup button) */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </Button>
          </div>
          
          {/* Only show Get Started on desktop */}
          <div className="hidden md:block">
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            ref={menuRef}
            className="fixed inset-0 top-16 z-40 bg-brand-background overflow-y-auto md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100vh - 64px)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col space-y-4 p-6 border-t border-brand-border">
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-base font-medium py-2 text-brand-foreground hover:text-brand-primary"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/t/demo"
                className="text-lg font-medium py-2 text-brand-foreground hover:text-brand-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Tipping
              </Link>
              <Link
                to="/contact"
                className="text-base font-medium py-2 text-brand-foreground hover:text-brand-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/faq"
                className="text-base font-medium py-2 text-brand-foreground hover:text-brand-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              
              {/* Get Started CTA for mobile */}
              <div className="pt-4 mt-4 border-t border-brand-border">
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button fullWidth={true} size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}