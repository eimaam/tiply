import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  gradient?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  actionLabel,
  onAction,
  className = '',
  gradient = false,
  icon,
  isLoading = false,
}) => {
  const baseClasses = 'rounded-xl border border-brand-border p-6 relative overflow-hidden';
  const cardClasses = gradient 
    ? `bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 ${baseClasses}`
    : `bg-brand-surface ${baseClasses}`;

  return (
    <motion.div 
      className={`${cardClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {gradient && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 rounded-full blur-3xl"></div>}
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        {actionLabel && onAction && (
          <Button variant="ghost" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="h-16 bg-brand-border/30 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};