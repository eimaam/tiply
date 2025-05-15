import { publicApi, privateApi } from "@/lib/api";
import { LoginCredentials, SignupData } from "@/lib/types/user";

export const authService = {
  /**
   * Login a user
   * @param email User email
   * @param password User password
   */
  login: (email: string, password: string) =>
    publicApi.post("/auth/login", { email, password }),

  /**
   * Register a new user
   * @param userData Registration data
   */
  register: (userData: SignupData) =>
    publicApi.post("/auth/register", userData),

  /**
   * Logout the current user
   */
  logout: () => privateApi.post("/auth/logout"),

  /**
   * Request password reset
   * @param email User email
   */
  forgotPassword: (email: string) =>
    publicApi.post("/auth/forgot-password", { email }),

  /**
   * Reset password with token
   * @param token Password reset token
   * @param password New password
   */
  resetPassword: (token: string, password: string) =>
    publicApi.post(`/auth/reset-password/${token}`, { password }),

  /**
   * Refresh access token using refresh token
   */
  refreshToken: () => publicApi.post("/auth/refresh", {}, { 
    withCredentials: true 
  }),

  /**
   * Get current authenticated user
   */
  getCurrentUser: () => privateApi.get("/auth/me"),

  /**
   * Verify email with verification token
   * @param token Email verification token
   */
  verifyEmail: (token: string) => publicApi.get(`/auth/verify-email/${token}`),
};
