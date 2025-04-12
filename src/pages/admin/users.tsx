// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  DollarOutlined,
  TeamOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { notification } from 'antd';
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalBody, 
  ModalFooter 
} from '@/components/ui/modal';

// Mock user data
const mockUsers = [
  {
    id: 'usr_1',
    username: 'sarahsmith',
    displayName: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    walletAddress: 'GvX8p2UT6wBQU1b9C2iLUwiDspcaQJgQRbwTiiYKuZBJ',
    status: 'active',
    role: 'creator',
    totalEarned: 1432.50,
    tipCount: 47,
    verified: true,
    joinDate: '2024-09-10T15:31:26Z',
    lastActive: '2025-04-10T22:15:33Z',
    avatar: null,
    isFeatured: true,
    customUrl: 'sarah-smith',
    bio: 'Digital artist and streamer creating fantasy worlds',
  },
  {
    id: 'usr_2',
    username: 'johndoe',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    status: 'active',
    role: 'creator',
    totalEarned: 876.25,
    tipCount: 29,
    verified: true,
    joinDate: '2024-10-05T09:22:47Z',
    lastActive: '2025-04-11T10:30:22Z',
    avatar: null,
    isFeatured: false,
    customUrl: 'johndoe',
    bio: 'Musician sharing original electronic tracks',
  },
  {
    id: 'usr_3',
    username: 'emmadavis',
    displayName: 'Emma Davis',
    email: 'emma.davis@example.com',
    walletAddress: '5Gptc3YdSNrWWrDNX5LbcjvK7K7fRx7ThDsT3rJ3vPGV',
    status: 'active',
    role: 'creator',
    totalEarned: 2150.00,
    tipCount: 68,
    verified: true,
    joinDate: '2024-08-18T14:15:39Z',
    lastActive: '2025-04-11T09:45:10Z',
    avatar: null,
    isFeatured: true,
    customUrl: 'emma-davis',
    bio: 'Travel photographer sharing my journeys across the globe',
  },
  {
    id: 'usr_4',
    username: 'michaelbrown',
    displayName: 'Michael Brown',
    email: 'michael.brown@example.com',
    walletAddress: 'DGQcrgMed4X8VSiKyGyJRwQwbCKi6pPUaxCbAP8h4iA',
    status: 'inactive',
    role: 'user',
    totalEarned: 0,
    tipCount: 0,
    verified: false,
    joinDate: '2025-03-22T11:20:15Z',
    lastActive: '2025-04-02T16:45:30Z',
    avatar: null,
    isFeatured: false,
    customUrl: null,
    bio: '',
  },
  {
    id: 'usr_5',
    username: 'sophiawilson',
    displayName: 'Sophia Wilson',
    email: 'sophia.wilson@example.com',
    walletAddress: 'EvBd2DRixzQNqnZwZXYDCj7iQRJqyY9Uf5APFUpm2N3t',
    status: 'active',
    role: 'creator',
    totalEarned: 3245.75,
    tipCount: 112,
    verified: true,
    joinDate: '2024-07-30T08:10:52Z',
    lastActive: '2025-04-11T11:05:28Z',
    avatar: null,
    isFeatured: true,
    customUrl: 'sophiawilson',
    bio: 'Software developer and tech blogger',
  },
  {
    id: 'usr_6',
    username: 'davidmiller',
    displayName: 'David Miller',
    email: 'david.miller@example.com',
    walletAddress: 'AC7LkXVkFUmxGKnAMj78uqYFbvEEuw6GfY6f9wRZsrCc',
    status: 'active',
    role: 'creator',
    totalEarned: 1750.50,
    tipCount: 55,
    verified: true,
    joinDate: '2024-11-08T16:25:43Z',
    lastActive: '2025-04-10T20:30:15Z',
    avatar: null,
    isFeatured: false,
    customUrl: 'davidmiller',
    bio: 'Game streamer and reviewer',
  },
  {
    id: 'usr_7',
    username: 'oliviajones',
    displayName: 'Olivia Jones',
    email: 'olivia.jones@example.com',
    walletAddress: 'HKjFdrYH1EkXH5gQMtLMMhEadssYhsXxm3HzPXhSAZgz',
    status: 'suspended',
    role: 'user',
    totalEarned: 125.00,
    tipCount: 3,
    verified: false,
    joinDate: '2025-02-14T10:55:22Z',
    lastActive: '2025-03-01T18:20:40Z',
    avatar: null,
    isFeatured: false,
    customUrl: null,
    bio: '',
  },
  {
    id: 'usr_8',
    username: 'jacobclark',
    displayName: 'Jacob Clark',
    email: 'jacob.clark@example.com',
    walletAddress: 'J2NKpZoGbJftbBayLJkKWXguLBXgxNw4r6QuiY3sGDyv',
    status: 'active',
    role: 'creator',
    totalEarned: 935.25,
    tipCount: 27,
    verified: true,
    joinDate: '2025-01-05T09:15:30Z',
    lastActive: '2025-04-09T14:50:12Z',
    avatar: null,
    isFeatured: false,
    customUrl: 'jacobclark',
    bio: 'Artist and illustrator specializing in fantasy art',
  },
];

// User stats data
const userStats = {
  totalUsers: 4320,
  activeUsers: 2876,
  inactiveUsers: 1432,
  suspendedUsers: 12,
  verifiedUsers: 1854,
  creatorUsers: 1235,
  regularUsers: 3085,
  topEarner: 'Sophia Wilson',
  totalEarned: 87652.50,
  averageTipsPerUser: 3.69,
};

const UsersAdminPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: 'lastActive', direction: 'desc' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API loading
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
  };

  // Get sorted and filtered users
  const getSortedAndFilteredUsers = () => {
    let filteredData = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredData = filteredData.filter(user => 
        user.username?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.walletAddress?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
      filteredData = filteredData.filter(user => user.role === selectedRole);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filteredData = filteredData.filter(user => user.status === selectedStatus);
    }
    
    // Apply verification filter
    if (selectedVerification !== 'all') {
      filteredData = filteredData.filter(user => {
        if (selectedVerification === 'verified') {
          return user.verified === true;
        } else {
          return user.verified === false;
        }
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  };
  
  const filteredAndSortedUsers = getSortedAndFilteredUsers();
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  // Handle user actions
  const viewUser = (user) => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  const confirmDeleteUser = (user) => {
    setCurrentUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = () => {
    // Would connect to API in real implementation
    setUsers(users.filter(user => user.id !== currentUser.id));
    setShowDeleteConfirm(false);
    notification.success({
      message: 'User Deleted',
      description: `${currentUser.displayName} has been successfully deleted.`
    });
  };

  const toggleUserStatus = (user) => {
    // Would connect to API in real implementation
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        const newStatus = u.status === 'active' ? 'inactive' : 'active';
        return { ...u, status: newStatus };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    notification.success({
      message: 'Status Updated',
      description: `${user.displayName}'s status has been updated.`
    });
  };

  const toggleFeaturedStatus = (user) => {
    // Would connect to API in real implementation
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, isFeatured: !u.isFeatured };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    notification.success({
      message: 'Featured Status Updated',
      description: `${user.displayName} has been ${user.isFeatured ? 'removed from' : 'added to'} featured creators.`
    });
  };

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

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircleOutlined className="mr-1" /> Active
          </span>
        );
      case 'inactive':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            <CloseCircleOutlined className="mr-1" /> Inactive
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <LockOutlined className="mr-1" /> Suspended
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time since last activity
  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
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
            {isSorted && (
              sortConfig.direction === 'asc' ? 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l-4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg> : 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <AdminLayout title="Users Management">
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
                <p className="text-brand-muted-foreground">Total Users</p>
                <h3 className="text-3xl font-bold mt-2">{userStats.totalUsers.toLocaleString()}</h3>
                <p className="text-brand-muted-foreground mt-2">
                  {userStats.activeUsers.toLocaleString()} active
                </p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full h-fit">
                <TeamOutlined className="text-xl text-brand-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-brand-muted-foreground">Creators</p>
                <h3 className="text-3xl font-bold mt-2">{userStats.creatorUsers.toLocaleString()}</h3>
                <p className="text-brand-muted-foreground mt-2">
                  {Math.round((userStats.creatorUsers / userStats.totalUsers) * 100)}% of users
                </p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-full h-fit">
                <StarOutlined className="text-xl text-brand-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-brand-muted-foreground">Total Tips Value</p>
                <h3 className="text-3xl font-bold mt-2">${userStats.totalEarned.toLocaleString()}</h3>
                <p className="text-brand-muted-foreground mt-2">
                  Avg ${(userStats.totalEarned / userStats.creatorUsers).toFixed(2)} per creator
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
                <p className="text-brand-muted-foreground">Verification Rate</p>
                <h3 className="text-3xl font-bold mt-2">
                  {Math.round((userStats.verifiedUsers / userStats.totalUsers) * 100)}%
                </h3>
                <p className="text-brand-muted-foreground mt-2">
                  {userStats.verifiedUsers.toLocaleString()} verified users
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full h-fit">
                <CheckCircleOutlined className="text-xl text-green-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64 md:w-80">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted-foreground" />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-brand-border rounded-md px-3 py-1.5 text-sm bg-brand-surface"
            >
              <option value="all">All Roles</option>
              <option value="creator">Creators</option>
              <option value="user">Regular Users</option>
            </select>
            
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-brand-border rounded-md px-3 py-1.5 text-sm bg-brand-surface"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select 
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="border border-brand-border rounded-md px-3 py-1.5 text-sm bg-brand-surface"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <FilterOutlined className="mr-2" /> 
              More Filters
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <DownloadOutlined className="mr-2" /> 
              Export CSV
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-border">
              <thead className="bg-brand-background">
                <tr>
                  <TableHeader label="User" sortKey="displayName" />
                  <TableHeader label="Username" sortKey="username" />
                  <TableHeader label="Status" sortKey="status" />
                  <TableHeader label="Role" sortKey="role" />
                  <TableHeader label="Email" sortKey="email" />
                  <TableHeader label="Joined" sortKey="joinDate" />
                  <TableHeader label="Last Active" sortKey="lastActive" />
                  <th className="px-6 py-3 text-right text-xs font-medium text-brand-muted-foreground uppercase tracking-wider">
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
                ) : currentUsers.length > 0 ? (
                  // Users data
                  currentUsers.map(user => (
                    <motion.tr 
                      key={user.id} 
                      variants={itemVariants}
                      className="hover:bg-brand-background/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img className="h-10 w-10 rounded-full" src={user.avatar} alt={`${user.displayName}'s avatar`} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                <UserOutlined className="text-brand-primary" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">
                              {user.displayName}
                              {user.verified && (
                                <CheckCircleOutlined className="ml-1 text-brand-primary" />
                              )}
                              {user.isFeatured && (
                                <StarFilled className="ml-1 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-brand-muted-foreground">
                              ${user.totalEarned.toFixed(2)} earned
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        @{user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`capitalize ${user.role === 'creator' ? 'text-brand-primary font-medium' : ''}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(user.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatLastActive(user.lastActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            title="View User"
                            onClick={() => viewUser(user)}
                          >
                            <EyeOutlined />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            title="Edit User"
                          >
                            <EditOutlined />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            title={user.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                            onClick={() => toggleFeaturedStatus(user)}
                          >
                            {user.isFeatured ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete User"
                            onClick={() => confirmDeleteUser(user)}
                          >
                            <DeleteOutlined />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  // No results
                  <tr>
                    <td colSpan={8} className="px-6 py-8 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <UserOutlined style={{ fontSize: '24px' }} className="text-brand-muted-foreground mb-2" />
                        <p className="text-brand-muted-foreground">No users found matching your criteria</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedRole('all');
                            setSelectedStatus('all');
                            setSelectedVerification('all');
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
          {filteredAndSortedUsers.length > 0 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-brand-border">
              <div className="text-sm text-brand-muted-foreground">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredAndSortedUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAndSortedUsers.length}</span> users
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

      {/* User Details Modal */}
      {showUserModal && currentUser && (
        <Modal
          title={
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <UserOutlined className="text-brand-primary" />
              </div>
              <div>
                <div className="text-lg font-medium flex items-center">
                  {currentUser.displayName}
                  {currentUser.verified && <CheckCircleOutlined className="ml-2 text-brand-primary" />}
                </div>
                <div className="text-sm text-brand-muted-foreground">@{currentUser.username}</div>
              </div>
            </div>
          }
          open={showUserModal}
          onCancel={() => setShowUserModal(false)}
          footer={[
            <Button 
              key="close" 
              onClick={() => setShowUserModal(false)} 
              variant="outline"
            >
              Close
            </Button>,
            <Button 
              key="edit" 
              onClick={() => {
                // Navigate to edit page
                setShowUserModal(false);
              }}
            >
              Edit Profile
            </Button>
          ]}
          width={700}
        >
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Status</h3>
                <p>{getStatusBadge(currentUser.status)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Role</h3>
                <p className="capitalize">{currentUser.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Email</h3>
                <p className="flex items-center">
                  <MailOutlined className="mr-1" /> {currentUser.email}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Join Date</h3>
                <p>{formatDate(currentUser.joinDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Last Active</h3>
                <p>{formatLastActive(currentUser.lastActive)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Wallet Address</h3>
                <p className="text-xs truncate font-mono">{currentUser.walletAddress}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Total Earned</h3>
                <p className="font-medium">${currentUser.totalEarned.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-muted-foreground mb-1">Total Tips Received</h3>
                <p>{currentUser.tipCount}</p>
              </div>
            </div>
            
            <div className="border-t border-brand-border pt-4">
              <h3 className="text-sm font-medium text-brand-muted-foreground mb-2">Bio</h3>
              <p className="text-sm">{currentUser.bio || 'No bio provided'}</p>
            </div>
            
            <div className="border-t border-brand-border pt-4">
              <h3 className="text-sm font-medium text-brand-muted-foreground mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <DollarOutlined className="mr-1" /> View Transactions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={() => toggleUserStatus(currentUser)}
                >
                  {currentUser.status === 'active' ? (
                    <><LockOutlined className="mr-1" /> Deactivate</>
                  ) : (
                    <><UnlockOutlined className="mr-1" /> Activate</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={() => toggleFeaturedStatus(currentUser)}
                >
                  {currentUser.isFeatured ? (
                    <><StarFilled className="mr-1 text-yellow-500" /> Remove from Featured</>
                  ) : (
                    <><StarOutlined className="mr-1" /> Mark as Featured</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                  onClick={() => {
                    setShowUserModal(false);
                    confirmDeleteUser(currentUser);
                  }}
                >
                  <DeleteOutlined className="mr-1" /> Delete User
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && currentUser && (
        <Modal
          open={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        >
          <ModalHeader>
            <ModalTitle>Confirm User Deletion</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete the user <strong>{currentUser.displayName}</strong>?</p>
            <p className="mt-2 text-brand-muted-foreground">This action cannot be undone. All user data, including transaction history, will be permanently removed.</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setShowDeleteConfirm(false)} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600 border-none text-white hover:text-white"
            >
              Delete User
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default UsersAdminPage;