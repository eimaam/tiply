import React, { useState, useEffect } from 'react';
import { 
  FilterOutlined, 
  SearchOutlined, 
  DownOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Popover } from 'antd';
import { cn } from '@/lib/utils';
import DateRangePicker from './DateRangePicker';
import { 
  DataFilter as DataFilterType,
  FilterComponentProps 
} from '@/lib/types/filters';
import { TransactionType, TransactionStatus, CurrencyType } from '@/lib/types/transaction';

const DataFilter: React.FC<FilterComponentProps> = ({
  filters,
  onFilterChange,
  isAdmin = false,
  isPremiumUser = false,
  availableTypes,
  availableStatuses,
  currencies,
  showReset = true,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>(filters.searchQuery || '');

  // Count the active filters whenever the filters prop changes
  useEffect(() => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    if (filters.currency) count++;
    if (filters.searchQuery) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Handle date range changes
  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    onFilterChange({
      ...filters,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Apply search when user presses Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange({
        ...filters,
        searchQuery: searchQuery || undefined
      });
    }
  };

  // Apply search when search button is clicked
  const handleSearchClick = () => {
    onFilterChange({
      ...filters,
      searchQuery: searchQuery || undefined
    });
  };

  // Handle type selection
  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value || undefined
    });
  };

  // Handle status selection
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value || undefined
    });
  };

  // Handle currency selection
  const handleCurrencyChange = (value: string) => {
    onFilterChange({
      ...filters,
      currency: value as CurrencyType || undefined
    });
  };

  // Handle amount range changes
  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({
      ...filters,
      minAmount: value
    });
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({
      ...filters,
      maxAmount: value
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    onFilterChange({
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    } as DataFilterType);
    setSearchQuery('');
    setOpen(false);
  };

  // Define filter popover content
  const filterContent = (
    <div className="p-4 w-[300px]" onClick={(e) => e.stopPropagation()}>
      <h3 className="font-medium mb-4">Filters</h3>
      
      {/* Transaction Type */}
      {availableTypes && availableTypes.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Transaction Type</label>
          <Select 
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="w-full"
          >
            <option value="">All Types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {typeof type === 'string' 
                  ? type.charAt(0).toUpperCase() + type.slice(1) 
                  : type}
              </option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Transaction Status */}
      {availableStatuses && availableStatuses.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select 
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full"
          >
            <option value="">All Statuses</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {typeof status === 'string' 
                  ? status.charAt(0).toUpperCase() + status.slice(1) 
                  : status}
              </option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Currency */}
      {currencies && currencies.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Currency</label>
          <Select 
            value={filters.currency || ''}
            onChange={handleCurrencyChange}
            className="w-full"
          >
            <option value="">All Currencies</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency.toUpperCase()}
              </option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Amount Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Amount Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minAmount !== undefined ? filters.minAmount : ''}
            onChange={handleMinAmountChange}
            className="w-full"
            min={0}
            step="0.01"
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxAmount !== undefined ? filters.maxAmount : ''}
            onChange={handleMaxAmountChange}
            className="w-full"
            min={0}
            step="0.01"
          />
        </div>
      </div>

      {/* Reset Button */}
      {showReset && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full flex justify-center items-center gap-2"
            onClick={handleResetFilters}
          >
            <ReloadOutlined className="text-sm" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      {/* Search Input */}
      <div className="relative flex-grow">
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          className="pl-9 pr-4 py-2 w-full"
        />
        <SearchOutlined 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted-foreground" 
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          onClick={handleSearchClick}
        >
          Search
        </Button>
      </div>
      
      {/* Date Range Picker */}
      <div className="flex-shrink-0">
        <DateRangePicker 
          startDate={filters.startDate || null}
          endDate={filters.endDate || null}
          onChange={handleDateRangeChange}
          isAdmin={isAdmin}
          isPremiumUser={isPremiumUser}
        />
      </div>
      
      {/* Filter Button */}
      <div className="flex-shrink-0">
        <Popover
          content={filterContent}
          trigger="click"
          open={open}
          onOpenChange={setOpen}
          placement="bottomRight"
          arrow={false}
        >
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2",
              activeFiltersCount > 0 && "border-brand-primary text-brand-primary"
            )}
          >
            <FilterOutlined />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-brand-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <DownOutlined className="text-xs" />
          </Button>
        </Popover>
      </div>
    </div>
  );
};

export default DataFilter;