import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserRole } from './types/user';

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
  name: "TipLink",
  description: "A decentralized tipping platform for creators and communities.",
  url: "https://usetiply.xyz",
  image: "https://usetiply.xyz/logo.png",
  twitterUrl: "https://twitter.com/tiplyHQ",
  repoUrl: "https://github.com/eimaam/tiply",
  supportEmail: "support@usetiply.xyz"
}