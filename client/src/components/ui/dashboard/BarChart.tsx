import React, { useState } from 'react';

export interface ChartData {
  value: number;
  label: string;
  secondaryValue?: string | number;
}

export interface BarChartProps {
  data: ChartData[];
  height?: number;
  isLoading?: boolean;
  title?: string;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showTooltip?: boolean;
  barColor?: string;
  showAxisLabels?: boolean;
  summary?: React.ReactNode;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 160,
  isLoading = false,
  title,
  className = '',
  valuePrefix = '',
  valueSuffix = '',
  showTooltip = true,
  barColor = 'bg-brand-primary',
  showAxisLabels = true,
  summary,
}) => {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 0.1); // Use at least 0.1 to avoid division by zero
  
  return (
    <div className={`bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      {isLoading ? (
        <div style={{ height: `${height}px` }} className="w-full bg-brand-border/30 rounded animate-pulse"></div>
      ) : (
        <div style={{ height: `${height}px` }} className="mb-4">
          <div className="w-full h-full flex items-end justify-between px-2 border-b border-l border-brand-border relative">
            {data.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center relative group"
                onMouseEnter={() => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
              >
                <div 
                  className={`w-10 ${barColor} rounded-t-md transition-all hover:opacity-80 cursor-pointer`}
                  style={{ 
                    height: `${Math.max((item.value / maxValue) * 100, 5)}%`,
                  }}
                ></div>
                <div className="mt-2 text-xs text-brand-muted-foreground">
                  {item.label}
                </div>
                
                {showTooltip && activeBar === index && (
                  <div className="absolute bottom-full mb-2 bg-brand-background border border-brand-border px-3 py-2 rounded-md shadow-sm text-sm whitespace-nowrap z-10">
                    <p><span className="font-medium">{item.label}:</span> {valuePrefix}{item.value.toLocaleString()}{valueSuffix}</p>
                    {item.secondaryValue && (
                      <p className="text-xs text-brand-muted-foreground mt-1">{item.secondaryValue}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="pt-4 mt-2 border-t border-brand-border">
          {summary}
        </div>
      )}
    </div>
  );
};