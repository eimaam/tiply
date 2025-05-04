/**
 * Default permissions for the application
 * Format: { name, description, slug, module }
 */
export const defaultPermissions = [
  // User permissions
  {
    name: 'View Own Profile',
    description: 'Can view own user profile',
    slug: 'profile:view-own',
    module: 'users',
  },
  {
    name: 'Edit Own Profile',
    description: 'Can edit own user profile',
    slug: 'profile:edit-own',
    module: 'users',
  },
  {
    name: 'View Own Transactions',
    description: 'Can view own transaction history',
    slug: 'transactions:view-own',
    module: 'transactions',
  },
  {
    name: 'Withdraw Funds',
    description: 'Can withdraw funds to wallet',
    slug: 'wallet:withdraw',
    module: 'wallet',
  },

  // Creator permissions
  {
    name: 'Customize Profile',
    description: 'Can customize public profile appearance',
    slug: 'profile:customize',
    module: 'profile',
  },
  {
    name: 'View Tipping Analytics',
    description: 'Can view tipping analytics',
    slug: 'analytics:view',
    module: 'analytics',
  },
  {
    name: 'Manage Tip Options',
    description: 'Can manage tipping options',
    slug: 'tip-options:manage',
    module: 'profile',
  },

  // Support permissions
  {
    name: 'View Support Tickets',
    description: 'Can view support tickets',
    slug: 'support:view-tickets',
    module: 'support',
  },
  {
    name: 'Manage Support Tickets',
    description: 'Can manage and respond to support tickets',
    slug: 'support:manage-tickets',
    module: 'support',
  },
  {
    name: 'View User Profiles',
    description: 'Can view any user profile',
    slug: 'profile:view-any',
    module: 'users',
  },

  // Admin permissions
  {
    name: 'Manage Users',
    description: 'Can manage all users',
    slug: 'users:manage',
    module: 'users',
  },
  {
    name: 'View All Transactions',
    description: 'Can view all transactions',
    slug: 'transactions:view-all',
    module: 'transactions',
  },
  {
    name: 'Manage Featured Creators',
    description: 'Can mark creators as featured',
    slug: 'creators:feature',
    module: 'users',
  },
  {
    name: 'View Dashboard',
    description: 'Can view admin dashboard',
    slug: 'dashboard:view',
    module: 'admin',
  },
  {
    name: 'Manage Permissions',
    description: 'Can manage user permissions',
    slug: 'permissions:manage',
    module: 'admin',
  },

  // Super Admin permissions
  {
    name: 'System Configuration',
    description: 'Can modify system configuration',
    slug: 'system:configure',
    module: 'admin',
  },
  {
    name: 'View System Logs',
    description: 'Can view system logs',
    slug: 'system:logs',
    module: 'admin',
  },
];

/**
 * Default user permission sets
 * Format: { type, permissions: [] }
 * This provides commonly assigned permission bundles for different user types
 */
export const defaultPermissionSets = {
  basicUser: [
    'profile:view-own',
    'profile:edit-own',
    'transactions:view-own',
    'wallet:withdraw',
  ],
  
  creator: [
    'profile:view-own',
    'profile:edit-own',
    'transactions:view-own',
    'wallet:withdraw',
    'profile:customize',
    'analytics:view',
    'tip-options:manage',
  ],
  
  support: [
    'profile:view-own',
    'profile:edit-own',
    'transactions:view-own',
    'wallet:withdraw',
    'support:view-tickets',
    'support:manage-tickets',
    'profile:view-any',
  ],
  
  admin: [
    'profile:view-own',
    'profile:edit-own',
    'transactions:view-own',
    'wallet:withdraw',
    'profile:customize',
    'analytics:view',
    'tip-options:manage',
    'support:view-tickets',
    'support:manage-tickets',
    'profile:view-any',
    'users:manage',
    'transactions:view-all',
    'creators:feature',
    'dashboard:view',
    'permissions:manage',
  ],
  
  superAdmin: [
    'profile:view-own',
    'profile:edit-own',
    'transactions:view-own',
    'wallet:withdraw',
    'profile:customize',
    'analytics:view',
    'tip-options:manage',
    'support:view-tickets',
    'support:manage-tickets',
    'profile:view-any',
    'users:manage',
    'transactions:view-all',
    'creators:feature',
    'dashboard:view',
    'permissions:manage',
    'system:configure',
    'system:logs',
  ]
};