import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DownloadOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import DataFilter from '@/components/ui/filters/DataFilter';
import { DataFilter as DataFilterType } from '@/lib/types/filters';
import { CurrencyType, TransactionStatus, TransactionType } from '@/lib/types/transaction';

// Mock transaction data
const mockTransactions = [
  {
    id: 'txn_1',
    amount: 25.00,
    fee: 0.63,
    netAmount: 24.37,
    status: 'completed',
    type: 'tip',
    sender: {
      displayName: 'Anonymous',
      walletAddress: '5Gptc3YdSNrWWrDNX5LbcjvK7K7fRx7ThDsT3rJ3vPGV',
    },
    recipient: {
      displayName: 'Sarah Smith',
      username: 'sarahsmith',
      walletAddress: 'GvX8p2UT6wBQU1b9C2iLUwiDspcaQJgQRbwTiiYKuZBJ',
    },
    message: 'Love your work! Keep it up!',
    timestamp: '2025-04-11T10:15:30Z',
    blockExplorerUrl: 'https://explorer.solana.com/tx/2NPp9fxrdhmNKsKnVwZz1iNLvKm7accq1fAVY1DKzHi7BZSPMQXyNcmWKs1zxA6SvvJPvSo6',
  },
  {
    id: 'txn_2',
    amount: 50.00,
    fee: 1.25,
    netAmount: 48.75,
    status: 'completed',
    type: 'tip',
    sender: {
      displayName: 'John Doe',
      username: 'johndoe',
      walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    },
    recipient: {
      displayName: 'Emma Davis',
      username: 'emmadavis',
      walletAddress: '5Gptc3YdSNrWWrDNX5LbcjvK7K7fRx7ThDsT3rJ3vPGV',
    },
    message: 'Thanks for the great content!',
    timestamp: '2025-04-11T09:30:15Z',
    blockExplorerUrl: 'https://explorer.solana.com/tx/2UazfVMwvGDnc95vpFkGynRpjXPD8q98QNyJLwtAH879rysZA4dHRvdXQuUTyH1MRNz1zZ79',
  },
  {
    id: 'txn_3',
    amount: 10.00,
    fee: 0.25,
    netAmount: 9.75,
    status: 'completed',
    type: 'tip',
    sender: {
      displayName: 'Anonymous',
      walletAddress: 'DGQcrgMed4X8VSiKyGyJRwQwbCKi6pPUaxCbAP8h4iA',
    },
    recipient: {
      displayName: 'Sophia Wilson',
      username: 'sophiawilson',
      walletAddress: 'EvBd2DRixzQNqnZwZXYDCj7iQRJqyY9Uf5APFUpm2N3t',
    },
    message: '',
    timestamp: '2025-04-10T22:18:05Z',
    blockExplorerUrl: 'https://explorer.solana.com/tx/4ZQ8LhxsqpuziVZUVP8yE6jPryyDPAn1pL7KEvDwcVVmcv9YwRbq2yeKdPBvC3X1Pm6k4aGP',
  },
  {
    id: 'txn_4',
    amount: 5.00,
    fee: 0.13,
    netAmount: 4.87,
    status: 'pending',
    type: 'tip',
    sender: {
      displayName: 'Michael Brown',
      username: 'michaelbrown',
      walletAddress: 'DGQcrgMed4X8VSiKyGyJRwQwbCKi6pPUaxCbAP8h4iA',
    },
    recipient: {
      displayName: 'Sarah Smith',
      username: 'sarahsmith',
      walletAddress: 'GvX8p2UT6wBQU1b9C2iLUwiDspcaQJgQRbwTiiYKuZBJ',
    },
    message: 'Great stream today!',
    timestamp: '2025-04-11T11:05:30Z',
    blockExplorerUrl: '',
  },
  {
    id: 'txn_5',
    amount: 100.00,
    fee: 2.50,
    netAmount: 97.50,
    status: 'completed',
    type: 'tip',
    sender: {
      displayName: 'David Miller',
      username: 'davidmiller',
      walletAddress: 'AC7LkXVkFUmxGKnAMj78uqYFbvEEuw6GfY6f9wRZsrCc',
    },
    recipient: {
      displayName: 'Sophia Wilson',
      username: 'sophiawilson',
      walletAddress: 'EvBd2DRixzQNqnZwZXYDCj7iQRJqyY9Uf5APFUpm2N3t',
    },
    message: 'Your work has been so inspiring. Thank you!',
    timestamp: '2025-04-10T16:45:20Z',
    blockExplorerUrl: 'https://explorer.solana.com/tx/3TvXRtknB7WTdmxoKrNrCS8AKGNdBhGQnHZEpYfaQD42JoZMbkrcGMBfvMn8howBwkHRGSiF',
  },
  {
    id: 'txn_6',
    amount: 15.00,
    fee: 0.38,
    netAmount: 14.62,
    status: 'failed',
    type: 'tip',
    sender: {
      displayName: 'Anonymous',
      walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    },
    recipient: {
      displayName: 'John Doe',
      username: 'johndoe',
      walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    },
    message: 'Keep up the amazing work!',
    timestamp: '2025-04-11T08:20:10Z',
    blockExplorerUrl: '',
    errorMessage: 'Insufficient funds',
  },
  {
    id: 'txn_7',
    amount: 30.00,
    fee: 0.75,
    netAmount: 29.25,
    status: 'completed',
    type: 'tip',
    sender: {
      displayName: 'Emma Davis',
      username: 'emmadavis',
      walletAddress: '5Gptc3YdSNrWWrDNX5LbcjvK7K7fRx7ThDsT3rJ3vPGV',
    },
    recipient: {
      displayName: 'John Doe',
      username: 'johndoe',
      walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    },
    message: 'Your latest project was amazing!',
    timestamp: '2025-04-10T13:10:45Z',
    blockExplorerUrl: 'https://explorer.solana.com/tx/2KCjRprKyr7dBJTcfMj8PrZyPQ6QBa1GYkVwnY8JrMBDuVQ9CTXeWVpZPiYVMCrTK6KMjuhY',
  },
];

// Transaction stats data
const transactionStats = {
  todayCount: 32,
  todayVolume: 745.50,
  todayFees: 18.64,
  weekCount: 243,
  weekVolume: 5680.25,
  weekFees: 142.01,
  totalCount: 15940,
  totalVolume: 87652.50,
  totalFees: 2191.31,
  successRate: 99.2,
  pendingCount: 8,
  failedCount: 3,
};

const TransactionsAdminPage = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  
  // New filters state using our DataFilter type
  const [filters, setFilters] = useState<DataFilterType>({
    searchQuery: '',
    startDate: undefined,
    endDate: undefined,
    type: undefined,
    status: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    currency: undefined,
    page: 1,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  // Simulate API data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Update filters with new sort configuration
    setFilters({
      ...filters,
      sortBy: key,
      sortOrder: direction as 'asc' | 'desc',
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: DataFilterType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get sorted and filtered transactions
  const getSortedAndFilteredTransactions = () => {
    let filteredData = [...transactions];
    
    // Apply search filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filteredData = filteredData.filter(txn => 
        txn.id.toLowerCase().includes(searchLower) ||
        txn.recipient.username?.toLowerCase().includes(searchLower) ||
        txn.recipient.displayName.toLowerCase().includes(searchLower) ||
        txn.sender.username?.toLowerCase().includes(searchLower) ||
        txn.sender.displayName.toLowerCase().includes(searchLower) ||
        txn.sender.walletAddress.toLowerCase().includes(searchLower) ||
        txn.recipient.walletAddress.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filteredData = filteredData.filter(txn => txn.status === filters.status);
    }
    
    // Apply type filter
    if (filters.type) {
      filteredData = filteredData.filter(txn => txn.type === filters.type);
    }
    
    // Apply date range filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredData = filteredData.filter(txn => new Date(txn.timestamp) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filteredData = filteredData.filter(txn => new Date(txn.timestamp) <= endDate);
    }
    
    // Apply amount filters
    if (filters.minAmount !== undefined) {
      filteredData = filteredData.filter(txn => txn.amount >= filters.minAmount!);
    }
    
    if (filters.maxAmount !== undefined) {
      filteredData = filteredData.filter(txn => txn.amount <= filters.maxAmount!);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        // Handle nested properties like recipient.displayName
        const aValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj[key], a)
          : a[sortConfig.key];
        const bValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj[key], b)
          : b[sortConfig.key];
          
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  };
  
  const filteredAndSortedTransactions = getSortedAndFilteredTransactions();
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredAndSortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  // Available filter options for the filter component
  const availableTypes = Object.values(TransactionType);
  const availableStatuses = Object.values(TransactionStatus);
  const currencies = Object.values(CurrencyType);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Handle transaction status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircleOutlined className="mr-1" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <SyncOutlined className="mr-1" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <CloseCircleOutlined className="mr-1" /> Failed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Table header with sorting
  const TableHeader = ({ label, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-brand-muted-foreground uppercase tracking-wider cursor-pointer"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center">
          <span>{label}</span>
          <span className="ml-1">
            {isSorted ? (
              sortConfig.direction === 'asc' ? <CaretUpOutlined /> : <CaretDownOutlined />
            ) : (
              <span className="text-brand-muted-foreground/30"><CaretUpOutlined /></span>
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <AdminLayout title="Transactions">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-brand-muted-foreground">Today's Volume</p>
                <h3 className="text-3xl font-bold mt-2">${transactionStats.todayVolume.toLocaleString()}</h3>
                <p className="text-brand-muted-foreground mt-2">
                  {transactionStats.todayCount} transactions
                </p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full h-fit">
                <DollarOutlined className="text-xl text-brand-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-brand-muted-foreground">Weekly Volume</p>
                <h3 className="text-3xl font-bold mt-2">${transactionStats.weekVolume.toLocaleString()}</h3>
                <p className="text-brand-muted-foreground mt-2">
                  {transactionStats.weekCount} transactions
                </p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full h-fit">
                <CalendarOutlined className="text-xl text-brand-primary" />
              </div>
            </div>
            </motion.div>

          <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-brand-muted-foreground">Platform Fees</p>
                <h3 className="text-3xl font-bold mt-2">${transactionStats.totalFees.toLocaleString()}</h3>
                <p className="text-brand-muted-foreground mt-2">
                  2.5% of total volume
                </p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full h-fit">
                <FileTextOutlined className="text-xl text-brand-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-brand-muted-foreground">Success Rate</p>
                <h3 className="text-3xl font-bold mt-2">{transactionStats.successRate}%</h3>
                <p className="text-yellow-500 flex items-center mt-2">
                  <PauseCircleOutlined className="mr-1" />
                  {transactionStats.pendingCount} pending
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full h-fit">
                <CheckCircleOutlined className="text-xl text-green-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* New DataFilter Component */}
        <DataFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          isAdmin={true}
          availableTypes={availableTypes}
          availableStatuses={availableStatuses}
          currencies={currencies}
          showReset={true}
          className="mb-4"
        />
        
        {/* Export Button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="flex items-center">
            <DownloadOutlined className="mr-2" /> 
            Export CSV
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-border">
              <thead className="bg-brand-background">
                <tr>
                  <TableHeader label="Transaction ID" sortKey="id" />
                  <TableHeader label="Date & Time" sortKey="timestamp" />
                  <TableHeader label="Status" sortKey="status" />
                  <TableHeader label="Amount" sortKey="amount" />
                  <TableHeader label="Fee" sortKey="fee" />
                  <TableHeader label="From" sortKey="sender.displayName" />
                  <TableHeader label="To" sortKey="recipient.displayName" />
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-brand-surface divide-y divide-brand-border">
                {isLoading ? (
                  // Loading state
                  Array(5).fill(0).map((_, index) => (
                    <tr key={`loading-${index}`}>
                      {Array(8).fill(0).map((_, cellIndex) => (
                        <td key={`loading-cell-${cellIndex}`} className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-brand-border/30 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : currentTransactions.length > 0 ? (
                  // Transactions data
                  currentTransactions.map(transaction => (
                    <motion.tr 
                      key={transaction.id} 
                      variants={itemVariants}
                      className="hover:bg-brand-background/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium font-mono">
                            {transaction.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{formatDate(transaction.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted-foreground">
                        ${transaction.fee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                              <UserOutlined className="text-brand-primary" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {transaction.sender.displayName}
                            </div>
                            <div className="text-xs text-brand-muted-foreground truncate max-w-[120px]">
                              {transaction.sender.username || 'Anonymous'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                              <UserOutlined className="text-brand-primary" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {transaction.recipient.displayName}
                            </div>
                            <div className="text-xs text-brand-muted-foreground truncate max-w-[120px]">
                              @{transaction.recipient.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            title="View Transaction Details"
                          >
                            <EyeOutlined />
                          </Button>
                          {transaction.blockExplorerUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              title="View on Blockchain Explorer"
                              onClick={() => window.open(transaction.blockExplorerUrl, '_blank')}
                            >
                              <LinkOutlined />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  // No results
                  <tr>
                    <td colSpan={8} className="px-6 py-8 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <FileTextOutlined style={{ fontSize: '24px' }} className="text-brand-muted-foreground mb-2" />
                        <p className="text-brand-muted-foreground">No transactions found matching your filters</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setFilters({
                              searchQuery: '',
                              startDate: undefined,
                              endDate: undefined,
                              type: undefined,
                              status: undefined,
                              minAmount: undefined,
                              maxAmount: undefined,
                              currency: undefined,
                              page: 1,
                              limit: 20,
                              sortBy: 'timestamp',
                              sortOrder: 'desc',
                            });
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredAndSortedTransactions.length > 0 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-brand-border">
              <div className="text-sm text-brand-muted-foreground">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredAndSortedTransactions.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAndSortedTransactions.length}</span> transactions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default TransactionsAdminPage;