import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { TransactionStatusEnum } from '@/types/transaction';

export interface TransactionCardProps {
  id: string | number;
  type: 'tip' | 'withdrawal' | 'new_user' | 'large_tip' | 'transaction_error' | string;
  user: string;
  details: string;
  timestamp: string;
  amount?: number;
  status?: TransactionStatusEnum;
  currency?: string;
  onClick?: () => void;
  className?: string;
  avatarUrl?: string;
  compact?: boolean;
  showActionButton?: boolean;
  actionButtonText?: string;
  actionButtonCallback?: () => void;
  animate?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  user,
  details,
  timestamp,
  amount,
  status = 'completed',
  currency = 'USD',
  onClick,
  className = '',
  avatarUrl,
  compact = false,
  showActionButton = false,
  actionButtonText = 'View',
  actionButtonCallback,
  animate = true
}) => {
  // Format the relative time (e.g., "2 hours ago")
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  // Status color mapping
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };
  
  // Type icon mapping
  const getTypeIcon = (transactionType: string) => {
    switch(transactionType) {
      case 'tip':
      case 'large_tip':
        return (
          <div className="bg-brand-primary/10 text-brand-primary rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="bg-blue-100 text-blue-800 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
        );
      case 'new_user':
        return (
          <div className="bg-purple-100 text-purple-800 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        );
      case 'transaction_error':
        return (
          <div className="bg-red-100 text-red-800 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-800 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
        );
    }
  };

  const cardContent = () => (
    <div className={`flex items-center ${compact ? 'py-3' : 'py-4'} border-b border-brand-border last:border-0 ${onClick ? 'cursor-pointer hover:bg-brand-background/50' : ''} transition-colors ${className}`}>
      <div className="mr-4">
        {avatarUrl ? (
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <img src={avatarUrl} alt={user} className="h-full w-full object-cover" />
          </div>  
        ) : (
          getTypeIcon(type)
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between mb-1">
          <h4 className="text-sm font-medium">{user}</h4>
          <span className="text-xs text-brand-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm text-brand-muted-foreground">{details}</p>
      </div>
      {amount !== undefined && (
        <div className="ml-4 text-right">
          <span className={`text-sm font-medium ${type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
            {type === 'withdrawal' ? '-' : '+'}${amount.toFixed(2)}
            <span className="text-xs ml-1">{currency}</span>
          </span>
          {status && (
            <div className="mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          )}
          
          {showActionButton && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (actionButtonCallback) actionButtonCallback();
              }}
              className="mt-2 text-xs text-brand-primary hover:underline"
            >
              {actionButtonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
  
  return animate ? (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {cardContent()}
    </motion.div>
  ) : (
    <div onClick={onClick}>
      {cardContent()}
    </div>
  );
};