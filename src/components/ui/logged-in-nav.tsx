import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './button';
import { 
  HomeOutlined, 
  UserOutlined, 
  LineChartOutlined, 
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import logo from '@/assets/images/tipp-link-logo.png'


interface LoggedInNavProps {
  username?: string;
  profileImage?: string;
}

export const LoggedInNav: React.FC<LoggedInNavProps> = ({ 
  username = 'username',
  profileImage 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/dashboard');

  // Determine active route on component mount and when location changes
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      setActiveRoute('/dashboard');
    } else if (path.startsWith('/profile')) {
      setActiveRoute('/profile');
    } else if (path.startsWith('/analytics')) {
      setActiveRoute('/analytics');
    } else if (path.startsWith('/settings')) {
      setActiveRoute('/settings');
    }
  }, [location]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeOutlined /> },
    { path: '/profile', label: 'Profile', icon: <UserOutlined /> },
    { path: '/dashboard?tab=analytics', label: 'Analytics', icon: <LineChartOutlined /> },
    { path: '/dashboard?tab=settings', label: 'Settings', icon: <SettingOutlined /> },
  ];

  // Handle navigation and close mobile menu if open
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Animation variants
  const mobileMenuVariants = {
    open: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }
    },
    closed: { 
      opacity: 0, 
      height: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  return (
    <header className='border-b border-brand-border bg-brand-surface sticky top-0 z-10'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex justify-between items-center'>
          {/* Logo */}
          <div className="flex items-center">
          <Link to="/" className="flex items-center space-x">
            <img src={logo} alt="Tipp Link Logo" className="h-8 md:h-12 w-auto" />
            <span className="text-xl font-bold text-brand-primary">tiply</span>
          </Link>
        </div>
          
          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-1'>
            {navItems.map((item) => (
              <Button 
                key={item.path}
                variant={activeRoute === item.path.split('?')[0] ? 'default' : 'ghost'} 
                onClick={() => handleNavigation(item.path)}
                icon={item.icon}
              >
                {item.label}
              </Button>
            ))}
            
            <Button 
              variant='outline'
              className='ml-4'
              size='sm'
              onClick={() => handleNavigation('/profile')}
            >
              <UserOutlined className='mr-1' /> @{username}
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <motion.nav
          className='md:hidden overflow-hidden'
          initial='closed'
          animate={isMobileMenuOpen ? 'open' : 'closed'}
          variants={mobileMenuVariants}
        >
          <div className='flex flex-col space-y-2 py-4'>
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={activeRoute === item.path.split('?')[0] ? 'default' : 'ghost'}
                onClick={() => handleNavigation(item.path)}
                fullWidth={true}
                className='justify-start'
                icon={item.icon}
              >
                {item.label}
              </Button>
            ))}
            
            <div className='border-t border-brand-border my-2 pt-2'>
              <Button
                variant='outline'
                fullWidth={true}
                className='justify-start mt-2'
                icon={<UserOutlined />}
                onClick={() => handleNavigation('/profile')}
              >
                @{username}
              </Button>
              
              <Button
                variant='ghost'
                fullWidth={true}
                className='justify-start mt-2 text-red-500 hover:text-red-600'
                icon={<LogoutOutlined />}
                onClick={() => handleNavigation('/login')}
              >
                Logout
              </Button>
            </div>
          </div>
        </motion.nav>
      </div>
    </header>
  );
};