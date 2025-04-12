import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  helpText?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  className?: string;
  iconBgClassName?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  helpText,
  prefix = '',
  suffix = '',
  loading = false,
  className = '',
  iconBgClassName = 'bg-brand-primary/10',
}) => {
  return (
    <div className={`bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex justify-between">
        <div>
          <p className="text-brand-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-8 w-32 bg-brand-border/30 rounded animate-pulse mt-2"></div>
          ) : (
            <h3 className="text-3xl font-bold mt-2">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </h3>
          )}
          {change && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              <span 
                className={`flex items-center ${
                  change.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {change.isPositive ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="w-4 h-4 mr-1"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="w-4 h-4 mr-1"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
                {change.value}%
              </span>
              {helpText && <span className="text-sm">{helpText}</span>}
            </div>
          )}
          
          {!change && helpText && (
            <div className="mt-2 text-sm text-brand-muted-foreground">{helpText}</div>
          )}
        </div>
        
        {icon && (
          <div className={`h-12 w-12 rounded-full ${iconBgClassName} flex items-center justify-center`}>
            <span className="text-xl text-brand-primary">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};