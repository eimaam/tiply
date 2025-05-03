import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { User, AuthData, LoginCredentials, SignupData } from '@/lib/types/user';
import { authService } from '@/services/auth.service';
import { privateApi } from '@/lib/api';
import api from '@/lib/api';

// Define the context state type
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingRequired: boolean;
  login: (credentials: LoginCredentials) => Promise<User | void>;
  register: (data: SignupData) => Promise<User | void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<any>;
  refreshUser: () => Promise<User | void>;
  completeOnboardingStep: (step: string) => Promise<any>;
}

// context with initial default values
const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingRequired: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
  completeOnboardingStep: async () => {},
});

// Custom hook for easy context consumption
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Check if the user is authenticated on mount - uses cookies automatically
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await refreshUser();
        console.log('User authenticated:', response);
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
      
      const authData: AuthData = response.data;
      
      // Update user state
      setUser(authData.user);
      
      // Check if onboarding is needed
      if (!authData.user.onboardingCompleted) {
        setOnboardingRequired(true);
        message.success('Welcome back! 🎉 Please complete your profile setup.');
        navigate('/onboarding');
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
      setOnboardingRequired(true);
      
      message.success('Account created successfully! 🎉 Let\'s set up your profile.');
      navigate('/onboarding');
      
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
      const response = await privateApi.put('/user/profile', userData);
      
      if (response.data) {
        setUser(prevUser => ({
          ...prevUser,
          ...response.data
        }));
      }
      
      message.success('Profile updated successfully! ✨');
      return response.data;
    } catch (error) {
      message.error('Failed to update profile. 😔 Please try again.');
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
        
        // Check if onboarding is required
        if (!response.data?.data?.user.onboardingCompleted) {
          setOnboardingRequired(true);
        } else {
          setOnboardingRequired(false);
        }
        
        return response.data?.data?.user;
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      // Clear user state if not authenticated
      setUser(null);
      setOnboardingRequired(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete an onboarding step
  const completeOnboardingStep = async (step: string) => {
    try {
      const response = await privateApi.post('/user/onboarding/step', { step });
      
      if (response.data) {
        setUser(prevUser => ({
          ...prevUser,
          ...response.data
        }));
        
        // Check if all onboarding is complete
        if (response.data.onboardingCompleted) {
          setOnboardingRequired(false);
        }
      }
      
      return response.data;
    } catch (error) {
      message.error('Failed to update onboarding progress. 😔');
      throw error;
    }
  };

  // Value object to be provided by the context
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !authChecked,
    onboardingRequired,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    completeOnboardingStep,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};