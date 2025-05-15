import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { User, AuthData, LoginCredentials, SignupData } from '@/lib/types/user';
import { authService } from '@/services/auth.service';
import { privateApi } from '@/lib/api';
import api from '@/lib/api';
import { userService } from '@/services/user.service';
import { publicApi } from '@/lib/api';

// Define the context state type
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User | void>;
  register: (data: SignupData) => Promise<User | void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<any>;
  refreshUser: () => Promise<User | void>;
}

// context with initial default values
const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
});

// Custom hook for easy context consumption
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      console.log('🔄 Refreshing access token...');
      
      // Directly use the API client to make the refresh token request
      // This gives us more control and visibility into the request/response
      const response = await publicApi.post('/auth/refresh', {}, { 
        withCredentials: true,
        // Add specific headers to help diagnose
        headers: {
          'X-Debug-Refresh': 'true'
        }
      });
      
      console.log('✅ Token refresh response:', response);
      
      if (response && response.data && response.data.success) {
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.error('❌ Token refresh failed - unexpected response:', response);
        return false;
      }
    } catch (error: any) {
      // More detailed error logging
      console.error('❌ Failed to refresh token. Error details:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Don't logout automatically on refresh failure
      return false;
    }
  };

  // Schedule token refresh
  const scheduleTokenRefresh = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set timer to refresh token after 25 minutes (5 minutes before 30-minute expiry)
    const REFRESH_TIME = 25 * 60 * 1000; // 25 minutes
    console.log('⏰ Scheduling token refresh in 25 minutes');
    
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken().then(success => {
        if (success) {
          // If successfully refreshed, schedule the next refresh
          scheduleTokenRefresh();
        }
      });
    }, REFRESH_TIME);
  };

  // Clear the refresh timer when component unmounts
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Check if the user is authenticated on mount - uses cookies automatically
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await refreshUser();
        console.log('User authenticated:', response);
        // Schedule token refresh if user is authenticated
        if (response) {
          scheduleTokenRefresh();
        }
      } catch (error) {
        // Handle silently - user isn't authenticated
        console.log('User not authenticated or session expired', error);
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials.email, credentials.password);
      
      const authData: AuthData = response.data?.data;
      console.log('Login response:', authData);
      // Update user state
      setUser(authData.user);
      
      // Schedule token refresh
      scheduleTokenRefresh();
      
      // Check if onboarding is needed
      if (!authData.user.onboardingCompleted) {
        message.success('Welcome back! 🎉 Please complete your profile setup.');
        navigate('/onboarding/');
      } else {
        message.success('Welcome back! 🎉');
        navigate('/dashboard');
      }
      
      return authData.user;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Login failed! 😔 Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: SignupData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      const authData: AuthData = response.data?.data
      console.log('Registration response:', authData);
      // Update user state
      setUser(authData.user);
      
      // Schedule token refresh
      scheduleTokenRefresh();
      
      message.success('Account created successfully! 🎉 Let\'s set up your profile.');
      navigate('/onboarding/step-1');
      
      return authData.user;
    } catch (error: any) {
      if (error?.response?.status === 409) {
        message.error('This email is already registered. 🤔');
      } else {
        message.error(error?.response?.data?.message || 'Registration failed! 😔 Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      // Clear the refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
      // Call logout endpoint to clear the cookie on the server
      await api.auth.logout();
      
      // Clear user state
      setUser(null);
      message.success('You\'ve been logged out. See you soon! 👋');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      // Use the userService instead of direct API call
      const response = await userService.updateProfile(userData);
      
      // The response structure is { data: User }
      if (response && response.data) {
        const updatedUser = response.data;
        
        // Merge the updated data with existing user data
        setUser(prevUser => {
          if (!prevUser) return updatedUser;
          return {
            ...prevUser,
            ...updatedUser
          };
        });
        
        message.success('Profile updated successfully! ✨');
        return updatedUser;
      }
      throw new Error('Failed to update profile');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update profile. 😔 Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data from the server
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      
      // Use getCurrentUser endpoint to get user data from server
      const response = await authService.getCurrentUser();

      if (response.data && response.data?.data?.user) {
        setUser(response.data?.data?.user);
        return response.data?.data?.user;
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      // Clear user state if not authenticated
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Value object to be provided by the context
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !authChecked,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};