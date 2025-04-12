import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  BellOutlined, 
  CloseOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Notification, isUserNotification, isAdminNotification } from './NotificationTypes';

export interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  position?: 'right' | 'left';
  maxHeight?: string;
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  position = 'right',
  maxHeight = '70vh',
  className = ''
}) => {
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification: Notification) => {
    if (isUserNotification(notification)) {
      switch (notification.type) {
        case 'tip':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-green-100 text-green-600 rounded-full"><DollarOutlined /></div>;
        case 'system':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-blue-100 text-blue-600 rounded-full"><CheckCircleOutlined /></div>;
        case 'promo':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-yellow-100 text-yellow-600 rounded-full"><CalendarOutlined /></div>;
      }
    } else if (isAdminNotification(notification)) {
      switch (notification.type) {
        case 'success':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-green-100 text-green-600 rounded-full"><CheckCircleOutlined /></div>;
        case 'warning':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-yellow-100 text-yellow-600 rounded-full"><WarningOutlined /></div>;
        case 'error':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-red-100 text-red-600 rounded-full"><CloseOutlined /></div>;
        case 'info':
          return <div className="p-2 w-7 h-7 md:w-8 md:h-8 flex justify-center bg-blue-100 text-blue-600 rounded-full"><InfoCircleOutlined /></div>;
      }
    }
    
    return <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-full"><BellOutlined /></div>;
  };

  // Animation variants
  const panelVariants = {
    open: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      opacity: 0, 
      y: '-10%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid="notification-panel"
          initial="closed"
          animate="open"
          exit="closed"
          variants={panelVariants}
          className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} mt-2 w-80 bg-brand-surface border border-brand-border rounded-lg shadow-lg z-50 ${className}`}
          style={{ maxHeight }}
        >
          {/* Header */}
          <div className="p-4 border-b border-brand-border flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <CloseOutlined />
              </Button>
            </div>
          </div>
          
          {/* Notification List */}
          <div className="divide-y divide-brand-border overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-brand-background transition-colors cursor-pointer ${!notification.read ? 'bg-brand-primary/5' : ''}`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notification)}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className={`font-medium text-sm ${!notification.read ? 'text-brand-primary' : ''}`}>
                          {notification.title}
                          {isUserNotification(notification) && notification.type === 'tip' && notification.amount && (
                            <span className="ml-1 text-green-500">{notification.amount}</span>
                          )}
                        </h4>
                        <button 
                          className="text-brand-muted-foreground hover:text-brand-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                          aria-label="Delete notification"
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
  );
};