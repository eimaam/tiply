import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BellOutlined } from '@ant-design/icons';
import { NotificationPanel, NotificationPanelProps } from './NotificationPanel';

export interface NotificationTriggerProps extends Omit<NotificationPanelProps, 'isOpen' | 'onClose'> {
  id?: string;
  buttonClassName?: string;
  panelClassName?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'sm' | 'lg' | 'icon' | 'md';
}

export const NotificationTrigger: React.FC<NotificationTriggerProps> = ({
  id = 'notification-button',
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  position = 'right',
  maxHeight = '70vh',
  className = '',
  buttonClassName = '',
  panelClassName = '',
  buttonVariant = 'ghost',
  buttonSize = 'md',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        panelRef.current && 
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        id={id}
        variant={buttonVariant}
        size={buttonSize}
        className={`rounded-full relative ${buttonClassName}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
        aria-expanded={isOpen}
        aria-controls="notification-panel"
      >
        <BellOutlined />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount}
          </span>
        )}
      </Button>
      
      <div ref={panelRef}>
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onDelete={onDelete}
          position={position}
          maxHeight={maxHeight}
          className={panelClassName}
        />
      </div>
    </div>
  );
};