import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  
} from '@ant-design/icons';
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalBody, 
  ModalFooter 
} from '@/components/ui/modal';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New user registered',
      message: 'Sarah Smith has joined the platform.',
      timestamp: '2025-04-11T10:30:00Z',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Transaction completed',
      message: 'Payment of $250.00 has been processed.',
      timestamp: '2025-04-11T09:45:20Z',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'System update',
      message: 'System maintenance scheduled for tonight at 2:00 AM.',
      timestamp: '2025-04-10T18:12:15Z',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Only show navigation items that have corresponding pages
  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: <AppstoreOutlined />,
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: <UserOutlined />,
    },
    {
      path: '/admin/transactions',
      label: 'Transactions',
      icon: <DollarOutlined />,
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // In a real app, clear auth tokens, user state etc.
    setShowLogoutModal(false);
    navigate('/login');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== id)
    );
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="p-2 w-8 h-8 flex bg-green-100 text-green-600 rounded-full"><UserOutlined /></div>;
      case 'warning':
        return <div className="p-2 w-8 h-8 flex bg-yellow-100 text-yellow-600 rounded-full"><ClockCircleOutlined /></div>;
      case 'error':
        return <div className="p-2 w-8 h-8 flex bg-red-100 text-red-600 rounded-full"><CloseOutlined /></div>;
      default:
        return <div className="p-2 w-8 h-8 flex bg-blue-100 text-blue-600 rounded-full"><BellOutlined /></div>;
    }
  };

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 64 }
  };

  const logoVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none', transition: { duration: 0.2 } }
  };

  const labelVariants = {
    expanded: { opacity: 1, display: 'block', transition: { delay: 0.1 } },
    collapsed: { opacity: 0, display: 'none', transition: { duration: 0.2 } }
  };

  const notificationPanelVariants = {
    open: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      opacity: 0, 
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-background">
      {/* Sidebar */}
      <motion.aside
        className="bg-brand-surface border-r border-brand-border h-screen sticky top-0 flex flex-col z-10"
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-brand-border flex items-center">
          <motion.div 
            variants={logoVariants}
            animate={collapsed ? 'collapsed' : 'expanded'}
            className="flex-1"
          >
            <h1 className="text-xl font-bold text-brand-primary mr-2">TippLink Admin</h1>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-md ${collapsed ? 'justify-center' : ''}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <motion.span 
                      variants={labelVariants}
                      animate={collapsed ? 'collapsed' : 'expanded'}
                      className="ml-3"
                    >
                      {item.label}
                    </motion.span>
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-2 border-t border-brand-border">
          <Button
            variant="ghost"
            className={`w-full justify-start rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
            onClick={() => setShowLogoutModal(true)}
          >
            <LogoutOutlined className="text-xl" />
            <motion.span
              variants={labelVariants}
              animate={collapsed ? 'collapsed' : 'expanded'}
              className="ml-3"
            >
              Logout
            </motion.span>
          </Button>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-brand-surface border-b border-brand-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-foreground">{title}</h1>
            
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-md border border-brand-border bg-brand-background w-64"
                />
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted-foreground" />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <BellOutlined />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {/* Notification Panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={notificationPanelVariants}
                      className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-brand-surface border border-brand-border rounded-lg shadow-lg z-50"
                    >
                      <div className="p-4 border-b border-brand-border flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        <div className="flex gap-2">
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllNotificationsAsRead}
                            >
                              Mark all read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowNotifications(false)}
                          >
                            <CloseOutlined />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-brand-border">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 hover:bg-brand-background transition-colors cursor-pointer ${!notification.read ? 'bg-brand-primary/5' : ''}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex gap-3">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <h4 className={`font-medium text-sm ${!notification.read ? 'text-brand-primary' : ''}`}>
                                      {notification.title}
                                    </h4>
                                    <button 
                                      className="text-brand-muted-foreground hover:text-brand-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                    >
                                      <CloseOutlined className="text-xs" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-brand-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-brand-muted-foreground mt-2">
                                    {formatRelativeTime(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-brand-muted-foreground">
                            No notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Admin Profile */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                  <UserOutlined />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-brand-muted-foreground">Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
      >
        <ModalHeader>
          <ModalTitle>Confirm Logout</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to logout?</p>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};