import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion, AnimatePresence } from 'framer-motion'
import { smoothScrollTo } from '@/lib/utils'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import logo from '@/assets/images/tipp-link-logo.png'

// Define all navigation links in one place
type NavLink = {
  label: string;
  type: 'hash' | 'route';
  href: string;
  className?: string;
}

const navigationLinks: NavLink[] = [
  { type: 'hash', href: '#how-it-works', label: 'How it works' },
  { type: 'hash', href: '#features', label: 'Features' },
  { type: 'hash', href: '#pricing', label: 'Pricing' },
  { type: 'hash', href: '#faq', label: 'FAQ' },
  // { type: 'route', href: '/t/demo', label: 'Start Tipping', className: 'text-lg' },
  { type: 'route', href: '/about', label: 'About' },
  { type: 'route', href: '/contact', label: 'Contact' },
  { type: 'route', href: '/faq', label: 'FAQ' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
    setMobileMenuOpen(false); 
  };

  // Handle clicks outside mobile menu to close it
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

  // render appropriate link based on type
  const renderNavLink = (link: NavLink, isMobile: boolean = false) => {
    const baseClassName = isMobile
      ? `${link.className || 'text-base'} font-medium py-2 text-brand-foreground hover:text-brand-primary`
      : 'text-sm text-brand-foreground hover:text-brand-primary transition-colors';

    if (link.type === 'hash') {
      return (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleSmoothScroll(e, link.href)}
          className={baseClassName}
        >
          {link.label}
        </a>
      );
    } else {
      return (
        <Link
          key={link.href}
          to={link.href}
          className={baseClassName}
          onClick={() => isMobile && setMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      );
    }
  };

  // Filter links for desktop (excluding duplicate FAQ link)
  const desktopLinks = navigationLinks.filter(link => 
    !(link.type === 'route' && link.href === '/faq')
  );

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-background/80 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <h1 className="flex items-center space-x-3">
            <a href="/" className="flex items-center">
              <div className="flex items-center">
                <img src={logo} alt="tiply Logo" className="h-8 w-auto" />
              </div>
              <div className="text-xl font-bold text-brand-foreground hidden md:block">
                tiply
              </div>
            </a>
          </h1>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {desktopLinks.map(link => renderNavLink(link))}
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
              {/* Render all mobile nav links */}
              {navigationLinks.map(link => renderNavLink(link, true))}
              
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