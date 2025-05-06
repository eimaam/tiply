import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserRole } from './types/user';
import { User } from '@/lib/types/user';
import { STEP_SEQUENCE, getStepNumber } from '@/contexts/OnboardingContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Smoothly scrolls to a target element with offset adjustment
 * @param targetId The ID of the element to scroll to (with or without #)
 * @param offset Optional offset in pixels, defaults to 80px to account for navbar
 */
export const smoothScrollTo = (targetId: string, offset = 80) => {
  // Ensure targetId starts with #
  const id = targetId.startsWith('#') ? targetId : `#${targetId}`;
  const targetElement = document.querySelector(id);
  
  if (targetElement) {
    window.scrollTo({
      top: targetElement.getBoundingClientRect().top + window.pageYOffset - offset,
      behavior: 'smooth'
    });
    return true;
  }
  return false;
}

/**
 * Check if a user has access to a feature based on their role
 * @param userRole The role of the current user
 * @param requiredRole The minimum role required for access
 * @returns Boolean indicating if the user has access
 */
export const hasRoleAccess = (
  userRole: UserRole,
  requiredRole: UserRole = UserRole.USER
): boolean => {
  // Define role hierarchy
  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 4,
    [UserRole.ADMIN]: 3,
    [UserRole.CREATOR]: 2,
    [UserRole.USER]: 1
  };
  
  // User has access if their role has equal or higher privilege than the required role
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const PROJECT_INFO = {
  name: "tiply",
  description: "A decentralized tipping platform for creators and communities.",
  url: "https://usetiply.xyz",
  image: "https://usetiply.xyz/logo.png",
  twitterUrl: "https://twitter.com/tiplyHQ",
  repoUrl: "https://github.com/eimaam/tiply",
  supportEmail: "support@usetiply.xyz"
}

// public routes
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/terms-of-service',
  '/privacy-policy',
  '/contact-us',
  '/about-us'
];

/**
 * Validates if a string is a valid Solana address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export const isValidSolanaAddress = (address: string): boolean => {
  // Basic validation for Solana addresses
  // Solana addresses are base58 encoded and typically 32-44 characters
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Check length
  if (address.length < 32 || address.length > 44) {
    return false;
  }
  
  // Check for valid base58 characters (alphanumeric without 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
};

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};