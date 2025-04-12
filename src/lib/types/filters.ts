import { TransactionType, TransactionStatus, CurrencyType } from './transaction';

/**
 * Interface for dashboard data filters
 */
export interface DataFilter {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType | string;
  status?: TransactionStatus | string;
  minAmount?: number;
  maxAmount?: number;
  currency?: CurrencyType;
  searchQuery?: string;
  isPremiumUser?: boolean; // Flag to determine if user has premium subscription
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for filter component props
 */
export interface FilterComponentProps {
  filters: DataFilter;
  onFilterChange: (filters: DataFilter) => void;
  isAdmin?: boolean;
  isPremiumUser?: boolean;
  availableTypes?: Array<TransactionType | string>;
  availableStatuses?: Array<TransactionStatus | string>;
  currencies?: Array<CurrencyType>;
  showReset?: boolean;
  className?: string;
}

/**
 * Interface for DateRangePickerProps
 */
export interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  maxDateRange?: number; // Maximum date range in days
  isAdmin?: boolean; // Whether the user is an admin (for unlimited date range)
  isPremiumUser?: boolean; // Whether the user has premium (for extended date range)
}

/**
 * Predefined date ranges
 */
export enum DateRangePreset {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  LAST_TWO_WEEKS = 'last_two_weeks',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time',
}

// Constants
export const MAX_FREE_DATE_RANGE_DAYS = 14; // Maximum date range for free users (2 weeks)
export const MAX_PREMIUM_DATE_RANGE_DAYS = 90; // Maximum date range for premium users (3 months)