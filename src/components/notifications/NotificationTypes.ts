// Base notification interface that all notification types extend
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// User-facing notifications (for regular users)
export interface UserNotification extends BaseNotification {
  type: 'tip' | 'system' | 'promo';
  amount?: string;
}

// Admin-facing notifications (for admin dashboard)
export interface AdminNotification extends BaseNotification {
  type: 'success' | 'info' | 'warning' | 'error';
}

// Union type for all notification types
export type Notification = UserNotification | AdminNotification;

// Utility function to check if a notification is a user notification
export function isUserNotification(notification: Notification): notification is UserNotification {
  return ['tip', 'system', 'promo'].includes(notification.type);
}

// Utility function to check if a notification is an admin notification
export function isAdminNotification(notification: Notification): notification is AdminNotification {
  return ['success', 'info', 'warning', 'error'].includes(notification.type);
}