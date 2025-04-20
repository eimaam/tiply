import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instances
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Public API - for unauthenticated requests
export const publicApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Private API - for authenticated requests
export const privateApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

const errorInterceptor = (error: AxiosError) => {
  const { response } = error;
  
  // Handle different status codes
  if (response?.status === 401) {
    // Unauthorized - clear token and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
  
  if (response?.status === 403) {
    // Forbidden - user doesn't have permissions
    // TODO: build a forbidden page and navigate to it 
    console.error('You do not have permission to access this resource');
  }
  
  if (response?.status === 404) {
    // Not found
    console.error('Resource not found');
  }
  
  if (response?.status === 500) {
    // Server error
    console.error('Server error occurred');
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
      publicApi.post('/auth/login', { email, password }),
    register: (userData: any) => 
      publicApi.post('/auth/register', userData),
    forgotPassword: (email: string) => 
      publicApi.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => 
      publicApi.post('/auth/reset-password', { token, password }),
  },
  
  // User endpoints
  user: {
    getProfile: () => 
      privateApi.get('/user/profile'),
    updateProfile: (userData: any) => 
      privateApi.put('/user/profile', userData),
    joinWaitlist: (email: string, name: string) =>
      publicApi.post('/user/waitlist', { email, name }),
  },
  
  // Transaction endpoints
  transactions: {
    getAll: (params?: any) => 
      privateApi.get('/transactions', { params }),
    getById: (id: string) => 
      privateApi.get(`/transactions/${id}`),
    create: (transactionData: any) => 
      privateApi.post('/transactions', transactionData),
  },
};

export default api;