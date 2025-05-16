import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { PUBLIC_ROUTES } from './utils';

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of callbacks to execute after token refresh
let refreshSubscribers: ((token: string) => void)[] = [];

// Create axios instances
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Public API - for unauthenticated requests
export const publicApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in all requests to handle HttpOnly cookies
});

// Private API - for authenticated requests
export const privateApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Subscribe to token refresh
const subscribeToTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Execute subscribers with new token
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// Function to handle refresh token
const refreshAccessToken = async () => {
  try {
    const response = await publicApi.post('/auth/refresh', {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear any stale auth state
    localStorage.removeItem('hasSession');
    
    // Only redirect to login if we're not already on a public route
    
    const currentPath = window.location.pathname;
    
    if (!PUBLIC_ROUTES.some(route => currentPath.startsWith(route))) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
};

// Request interceptor for private API
privateApi.interceptors.request.use(
  (config) => {
    // Always ensure cookies are sent with the request
    config.withCredentials = true;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and token refresh
const responseInterceptor = (response: AxiosResponse) => {
  // If we get a successful response from an authenticated endpoint, 
  // mark that we have a valid session
  if (response.config.withCredentials) {
    localStorage.setItem('hasSession', 'true');
  }
  return response;
};

const errorInterceptor = async (error: AxiosError) => {
  const { response, config } = error;

  // Log more details when we get a 401 response
  if (response?.status === 401) {
    console.log('Received 401 error:', {
      url: config?.url,
      responseData: response.data,
      withCredentials: config?.withCredentials
    });
  }
  
  // Handle token expiration
  if (response?.status === 401 && 
      response.data && 
      (response.data as any).code === 'TOKEN_EXPIRED' && 
      !config?.url?.includes('/auth/refresh')) {
    
    // If we're not already refreshing
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const result = await refreshAccessToken();
        
        // Notify all subscribers that the token has been refreshed
        onTokenRefreshed('success');
        
        // Create a new request with the original config
        if (config) {
          // Ensure withCredentials is set for the retry
          config.withCredentials = true;
        }
        return privateApi(config!);
      } catch (refreshError) {
        // If refresh fails, reject all subscribers
        refreshSubscribers = [];
        localStorage.removeItem('hasSession');
        return Promise.reject(refreshError);
      }
    } else {
      // If already refreshing, add request to queue
      return new Promise((resolve) => {
        subscribeToTokenRefresh(() => {
          if (config) {
            // Ensure withCredentials is set for the retry
            config.withCredentials = true;
          }
          resolve(privateApi(config!));
        });
      });
    }
  }
  
  // Handle different status codes
  if (response?.status === 401 && !config?.url?.includes('/auth/refresh')) {
    // Unauthorized - clear session indicator
    localStorage.removeItem('hasSession');
    
    // Only redirect if not already on auth pages
    
    const currentPath = window.location.pathname;
    
    if (!PUBLIC_ROUTES.some(route => currentPath.startsWith(route))) {
      window.location.href = '/login';
    }
  }
  
  if (response?.status === 403) {
    // Forbidden - user doesn't have permissions
    console.error('You do not have permission to access this resource 🔒');
  }
  
  if (response?.status === 404) {
    // Not found
    console.error('Resource not found 🔍');
  }
  
  if (response?.status === 500) {
    // Server error
    console.error('Server error occurred 😵');
  }
  
  return Promise.reject(error);
};

// Add response interceptors to both API instances
publicApi.interceptors.response.use(responseInterceptor, errorInterceptor);
privateApi.interceptors.response.use(responseInterceptor, errorInterceptor);

// Utility functions for common API operations
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      publicApi.post('/auth/login', { email, password }, { withCredentials: true }),
    register: (userData: any) => 
      publicApi.post('/auth/register', userData, { withCredentials: true }),
    forgotPassword: (email: string) => 
      publicApi.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => 
      publicApi.post(`/auth/reset-password/${token}`, { password }),
    logout: () => 
      privateApi.post('/auth/logout', {}, { withCredentials: true }),
    refresh: () =>
      publicApi.post('/auth/refresh', {}, { withCredentials: true }),
    getCurrentUser: () =>
      privateApi.get('/auth/me', { withCredentials: true }),
    checkAuth: () => {
      // Use the presence of the hasSession flag as an optimization
      // to avoid unnecessary API calls when we know there's no session
      const hasSession = localStorage.getItem('hasSession');
      if (hasSession === 'true') {
        return privateApi.get('/auth/me', { withCredentials: true });
      }
      return Promise.reject(new Error('No active session'));
    }
  },
  
  // User endpoints
  user: {
    getProfile: () => 
      privateApi.get('/user/profile', { withCredentials: true }),
    updateProfile: (userData: any) => 
      privateApi.put('/users/profile', userData, { withCredentials: true }),
    joinWaitlist: (email: string, name: string) =>
      publicApi.post('/waitlist', { email, name }),
  },
  
  // Transaction endpoints
  transactions: {
    getAll: (params?: any) => 
      privateApi.get('/transactions', { params, withCredentials: true }),
    getById: (id: string) => 
      privateApi.get(`/transactions/${id}`, { withCredentials: true }),
    create: (transactionData: any) => 
      privateApi.post('/transactions', transactionData, { withCredentials: true }),
  },
};

export default api;