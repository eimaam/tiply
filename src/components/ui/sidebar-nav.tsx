import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { 
  HomeOutlined, 
  UserOutlined, 
  LineChartOutlined, 
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  DollarOutlined,
  BellOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import logo from '@/assets/images/tipp-link-logo.png'
import { smoothScrollTo } from '@/lib/utils';

interface SidebarNavProps {
  username?: string;
  profileImage?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  username = 'username',
  profileImage 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      
      if (
        sidebar && 
        !sidebar.contains(event.target) && 
        menuButton && 
        !menuButton.contains(event.target) && 
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeOutlined /> },
    { path: '/profile', label: 'Profile', icon: <UserOutlined /> },
    { path: '/dashboard?tab=analytics', label: 'Analytics', icon: <LineChartOutlined /> },
    { path: '/dashboard?tab=tips', label: 'Tips', icon: <DollarOutlined /> },
    { path: '/dashboard?tab=settings', label: 'Settings', icon: <SettingOutlined /> },
  ];

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 }
  };

  return (
    <>
      {/* Header with logo and menu button */}
      <header className='border-b border-brand-border bg-brand-surface sticky top-0 z-20'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            {/* Logo */}
            
            <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x">
            <img src={logo} alt="Tipp Link Logo" className="h-8 md:h-12 w-auto" />
            <span className="text-xl font-bold text-brand-primary">TippLink</span>
          </Link>
        </div>
            
            {/* Menu Button */}
            <Button
              id='menu-button'
              variant='ghost'
              size='icon'
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label='Toggle menu'
              className='rounded-full'
            >
              <MenuOutlined />
            </Button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className='fixed inset-0 bg-black z-30'
            initial='closed'
            animate='open'
            exit='closed'
            variants={overlayVariants}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            id='sidebar'
            className='fixed top-0 left-0 h-full w-64 bg-brand-surface z-40 border-r border-brand-border shadow-xl'
            initial='closed'
            animate='open'
            exit='closed'
            variants={sidebarVariants}
          >
            <div className='flex flex-col h-full'>
              {/* Sidebar Header */}
              <div className='p-4 border-b border-brand-border flex justify-between items-center'>
                <h2 className='text-xl font-bold text-brand-primary'>Menu</h2>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label='Close menu'
                  className='rounded-full'
                >
                  <CloseOutlined />
                </Button>
              </div>

              {/* User Profile Section */}
              <div className='p-4 border-b border-brand-border'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary'>
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={username} 
                        className='w-full h-full rounded-full object-cover' 
                      />
                    ) : (
                      <UserOutlined style={{ fontSize: '1.2rem' }} />
                    )}
                  </div>
                  <div>
                    <div className='font-medium'>@{username}</div>
                    <Link 
                      to='/profile' 
                      className='text-xs text-brand-primary hover:underline'
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className='flex-1 overflow-y-auto p-4'>
                <ul className='space-y-2'>
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Button
                        variant={activeRoute === item.path.split('?')[0] ? 'default' : 'ghost'}
                        onClick={() => handleNavigation(item.path)}
                        fullWidth={true}
                        className='justify-start text-left'
                        icon={item.icon}
                      >
                        {item.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Bottom Section */}
              <div className='p-4 border-t border-brand-border space-y-2'>
                <Button
                  variant='ghost'
                  fullWidth={true}
                  className='justify-start'
                  icon={<QuestionCircleOutlined />}
                  onClick={() => handleNavigation('/faq')}
                >
                  Help & FAQ
                </Button>
                <Button
                  variant='ghost'
                  fullWidth={true}
                  className='justify-start text-red-500 hover:text-red-600'
                  icon={<LogoutOutlined />}
                  onClick={() => handleNavigation('/login')}
                >
                  Logout
                </Button>
              </div>

              {/* Footer */}
              <div className='p-4 text-center text-xs text-brand-muted-foreground'>
                &copy; {new Date().getFullYear()} TipLink
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};