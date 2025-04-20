/**
 * Base notification type with shared properties
 */
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/**
 * User-specific notification types
 */
export interface UserNotification extends BaseNotification {
  type: 'tip' | 'system' | 'promo';
  amount?: string; // Optional amount for tip notifications
}

/**
 * Admin-specific notification types
 */
export interface AdminNotification extends BaseNotification {
  type: 'info' | 'warning' | 'success' | 'error';
}

/**
 * Union type for all notification types
 */
export type Notification = UserNotification | AdminNotification;

/**
 * Type guard to check if a notification is an AdminNotification
 */
export const isAdminNotification = (notification: Notification): notification is AdminNotification => {
  return ['info', 'warning', 'success', 'error'].includes(notification.type as string);
};

/**
 * Type guard to check if a notification is a UserNotification
 */
export const isUserNotification = (notification: Notification): notification is UserNotification => {
  return ['tip', 'system', 'promo'].includes(notification.type as string);
};