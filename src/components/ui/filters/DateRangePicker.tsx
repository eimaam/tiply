import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CalendarOutlined, 
  DownOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import { 
  DateRangePickerProps, 
  DateRangePreset, 
  MAX_FREE_DATE_RANGE_DAYS, 
  MAX_PREMIUM_DATE_RANGE_DAYS 
} from '@/lib/types/filters';
import { cn } from '@/lib/utils';
import { Popover, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * Helper function to calculate date range based on preset
 */
const getDateRangeFromPreset = (preset: DateRangePreset): [Date, Date] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case DateRangePreset.TODAY:
      return [today, new Date()];
    
    case DateRangePreset.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return [yesterday, yesterday];
    }
    
    case DateRangePreset.THIS_WEEK: {
      const firstDayOfWeek = new Date(today);
      const day = today.getDay() || 7; // Convert Sunday (0) to 7
      firstDayOfWeek.setDate(today.getDate() - day + 1); // Monday as first day
      return [firstDayOfWeek, new Date()];
    }
    
    case DateRangePreset.LAST_WEEK: {
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay() - 6);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      return [lastWeekStart, lastWeekEnd];
    }
    
    case DateRangePreset.LAST_TWO_WEEKS: {
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);
      return [twoWeeksAgo, new Date()];
    }
    
    case DateRangePreset.THIS_MONTH: {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return [firstDayOfMonth, new Date()];
    }
    
    case DateRangePreset.LAST_MONTH: {
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return [firstDayOfLastMonth, lastDayOfLastMonth];
    }

    case DateRangePreset.THIS_QUARTER: {
      const quarter = Math.floor(today.getMonth() / 3);
      const firstDayOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
      return [firstDayOfQuarter, new Date()];
    }

    case DateRangePreset.LAST_QUARTER: {
      const quarter = Math.floor(today.getMonth() / 3);
      const lastQuarter = quarter === 0 ? 3 : quarter - 1;
      const year = quarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const firstDayOfLastQuarter = new Date(year, lastQuarter * 3, 1);
      const lastDayOfLastQuarter = new Date(
        lastQuarter === 3 ? year + 1 : year,
        lastQuarter === 3 ? 0 : (lastQuarter + 1) * 3,
        0
      );
      return [firstDayOfLastQuarter, lastDayOfLastQuarter];
    }

    case DateRangePreset.THIS_YEAR: {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      return [firstDayOfYear, new Date()];
    }

    case DateRangePreset.LAST_YEAR: {
      const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const lastDayOfLastYear = new Date(today.getFullYear(), 0, 0);
      return [firstDayOfLastYear, lastDayOfLastYear];
    }

    case DateRangePreset.ALL_TIME:
      // This would typically fetch from your app's start date
      // For demo purposes, using 2 years ago
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      return [twoYearsAgo, new Date()];

    default:
      return [new Date(today.setDate(today.getDate() - 13)), new Date()];
  }
};

const isDateRangeValid = (
  startDate: Date | null,
  endDate: Date | null,
  maxDays: number
): boolean => {
  if (!startDate || !endDate) {
    return true;
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= maxDays;
};

/**
 * Format date range as a display string
 */
const formatDateRange = (startDate: Date | null, endDate: Date | null): string => {
  if (!startDate && !endDate) {
    return 'All time';
  }
  
  if (startDate && !endDate) {
    return `Since ${startDate.toLocaleDateString()}`;
  }
  
  if (!startDate && endDate) {
    return `Until ${endDate.toLocaleDateString()}`;
  }
  
  // Check if same day
  if (
    startDate &&
    endDate &&
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return startDate.toLocaleDateString();
  }
  
  // Different days
  return `${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  maxDateRange,
  isAdmin = false,
  isPremiumUser = false,
}) => {
  const [open, setOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<Date | null>(startDate);
  const [localEndDate, setLocalEndDate] = useState<Date | null>(endDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine max date range based on user type
  const maxDays = isAdmin
    ? Infinity
    : isPremiumUser
    ? MAX_PREMIUM_DATE_RANGE_DAYS
    : MAX_FREE_DATE_RANGE_DAYS;

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      setLocalStartDate(null);
      setLocalEndDate(null);
      setErrorMessage(null);
      return;
    }

    const newStartDate = dates[0].toDate();
    const newEndDate = dates[1].toDate();

    if (!isAdmin && !isPremiumUser) {
      // Check if the date range is within the allowed limit for free users
      const diffTime = Math.abs(newEndDate.getTime() - newStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > MAX_FREE_DATE_RANGE_DAYS) {
        setErrorMessage(`Free users can only view up to ${MAX_FREE_DATE_RANGE_DAYS} days of data. Upgrade to premium for more.`);
        return;
      }
    } else if (!isAdmin && isPremiumUser) {
      // Check for premium users
      const diffTime = Math.abs(newEndDate.getTime() - newStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > MAX_PREMIUM_DATE_RANGE_DAYS) {
        setErrorMessage(`Premium users can view up to ${MAX_PREMIUM_DATE_RANGE_DAYS} days of data.`);
        return;
      }
    }

    setLocalStartDate(newStartDate);
    setLocalEndDate(newEndDate);
    setErrorMessage(null);
  };

  const handlePresetClick = (preset: DateRangePreset) => {
    const [presetStartDate, presetEndDate] = getDateRangeFromPreset(preset);
    
    // Check if the preset is allowed for the user type
    if (!isAdmin && !isPremiumUser) {
      const diffTime = Math.abs(presetEndDate.getTime() - presetStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > MAX_FREE_DATE_RANGE_DAYS) {
        setErrorMessage(`Free users can only view up to ${MAX_FREE_DATE_RANGE_DAYS} days of data. Upgrade to premium for more.`);
        return;
      }
    } else if (!isAdmin && isPremiumUser) {
      const diffTime = Math.abs(presetEndDate.getTime() - presetStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > MAX_PREMIUM_DATE_RANGE_DAYS) {
        setErrorMessage(`Premium users can view up to ${MAX_PREMIUM_DATE_RANGE_DAYS} days of data.`);
        return;
      }
    }

    setLocalStartDate(presetStartDate);
    setLocalEndDate(presetEndDate);
    setErrorMessage(null);
  };

  const handleApply = () => {
    onChange(localStartDate, localEndDate);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
    setErrorMessage(null);
    onChange(null, null);
    setOpen(false);
  };

  const renderPresets = () => {
    const presets = [
      { label: 'Today', value: DateRangePreset.TODAY },
      { label: 'Yesterday', value: DateRangePreset.YESTERDAY },
      { label: 'This Week', value: DateRangePreset.THIS_WEEK },
      { label: 'Last Week', value: DateRangePreset.LAST_WEEK },
      { label: 'Last 2 Weeks', value: DateRangePreset.LAST_TWO_WEEKS },
    ];

    // Add more presets for premium users and admins
    if (isPremiumUser || isAdmin) {
      presets.push(
        { label: 'This Month', value: DateRangePreset.THIS_MONTH },
        { label: 'Last Month', value: DateRangePreset.LAST_MONTH }
      );
    }

    // Add even more presets for admins
    if (isAdmin) {
      presets.push(
        { label: 'This Quarter', value: DateRangePreset.THIS_QUARTER },
        { label: 'Last Quarter', value: DateRangePreset.LAST_QUARTER },
        { label: 'This Year', value: DateRangePreset.THIS_YEAR },
        { label: 'Last Year', value: DateRangePreset.LAST_YEAR },
        { label: 'All Time', value: DateRangePreset.ALL_TIME }
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 mb-4">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    );
  };

  const content = (
    <div className="p-4 w-[340px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Date Range</h4>
        {renderPresets()}
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Custom Range</h4>
        <RangePicker
          value={[
            localStartDate ? dayjs(localStartDate) : null,
            localEndDate ? dayjs(localEndDate) : null,
          ]}
          onChange={handleDateRangeChange as any}
          className="w-full"
          allowClear={true}
          disabledDate={(current) => {
            return current && current > dayjs().endOf('day');
          }}
        />
      </div>

      {errorMessage && (
        <div className="text-red-500 text-xs mb-4">{errorMessage}</div>
      )}

      {!isPremiumUser && !isAdmin && (
        <div className="text-xs text-brand-muted-foreground mb-4">
          Free users can view up to 14 days of data.{' '}
          <a href="/pricing" className="text-brand-primary hover:underline">
            Upgrade to premium
          </a>{' '}
          for up to 90 days.
        </div>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      overlayClassName="date-range-popover"
    >
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'flex items-center gap-2',
          (startDate || endDate) && 'border-brand-primary text-brand-primary'
        )}
      >
        <CalendarOutlined />
        <span>
          {startDate || endDate
            ? formatDateRange(startDate, endDate)
            : 'Date Range'}
        </span>
        <DownOutlined className="text-xs" />
      </Button>
    </Popover>
  );
};

export default DateRangePicker;