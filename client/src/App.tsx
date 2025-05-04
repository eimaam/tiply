import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { hasRoleAccess } from '@/lib/utils';
import { UserRole } from '@/lib/types/user';

// Landing page components
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { FAQSection } from '@/components/faq/faq-section';
import { Footer } from '@/components/landing/footer';

// Auth components
import { Login } from '@/pages/auth/login';
import { SignUp } from '@/pages/auth/signup';
import { Onboarding } from '@/pages/auth/onboarding';

// Dashboard components
import { Dashboard } from '@/pages/dashboard';
import { TipPage } from '@/pages/tip';

// Admin components
import AdminDashboard from '@/pages/admin/dashboard';
import AdminSettings from '@/pages/admin/settings';
import AdminTransactions from '@/pages/admin/transactions';
import AdminUsers from '@/pages/admin/users';

// Page components
import { FAQPage } from '@/pages/faq';
import { ContactPage } from '@/pages/contact';
import AboutUsPage from '@/pages/about';
import ProfilePage from '@/pages/profile';
import EditProfile from '@/pages/profile-edit';
import WaitlistPage from './pages/waitlist';
import ErrorPage from './pages/error-page';
import { message } from 'antd';
import { Spin } from 'antd';
import { useUser } from './contexts/UserContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import Homepage from './pages/home';

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: UserRole;
}

// Layout components
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
  </>
);

// Role-based route guard component
const ProtectedRoute = ({ 
  element, 
  requiredRole = UserRole.USER 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useUser();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="Loading your account..." />
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If onboarding is required and not already on onboarding page
  if (user && !user.onboardingCompleted && !location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding/username" replace />;
  }
  
  // Check role-based access
  const userRole = user?.role || UserRole.USER;
  const hasAccess = hasRoleAccess(userRole, requiredRole);
  
  if (!hasAccess) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and has the required role
  return <>{element}</>;
};

// Onboarding route component
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useUser();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="Loading your account..." />
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If onboarding is already completed, redirect to dashboard
  if (user && user.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
};

function App() {
  // Set up Ant Design message configuration globally
  message.config({
    maxCount: 1
  });

  return (
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WaitlistPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
  );
}

export default App;