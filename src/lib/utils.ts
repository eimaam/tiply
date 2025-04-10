import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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