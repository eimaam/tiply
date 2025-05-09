import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { hasRoleAccess } from '@/lib/utils';
import { UserRole } from '@/lib/types/user';

// Auth components
import { Login } from '@/pages/auth/login';
import { SignUp } from '@/pages/auth/signup';
import { Onboarding } from '@/pages/auth/onboarding';

// Dashboard components
import { Dashboard } from '@/pages/dashboard';

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
import TipPage from './pages/tip';

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
        <Route path="/" element={<Homepage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/:username" element={<TipPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutUsPage />} />
          
        {/* Auth routes */}
        <Route path="/login" element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        } />
        <Route path="/signup" element={
          <AuthLayout>
            <SignUp />
          </AuthLayout>
        } />
        
        {/* Onboarding routes with OnboardingProvider - using semantic paths */}
        <Route path="/onboarding" element={
          <AuthLayout>
            <OnboardingRoute>
              <Navigate to="/onboarding/username" replace />
            </OnboardingRoute>
          </AuthLayout>
        } />
        <Route path="/onboarding/:stepName" element={
          <AuthLayout>
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          </AuthLayout>
        } />

        {/* User routes - accessible by all authenticated users */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requiredRole={UserRole.USER} />} />
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} requiredRole={UserRole.USER} />} />
        <Route path="/profile/edit" element={<ProtectedRoute element={<EditProfile />} requiredRole={UserRole.USER} />} />
        
        {/* Admin routes - accessible by admin and superadmin */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole={UserRole.ADMIN} />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRole={UserRole.ADMIN} />} />
        <Route path="/admin/users" element={<ProtectedRoute element={<AdminUsers />} requiredRole={UserRole.ADMIN} />} />
        <Route path="/admin/transactions" element={<ProtectedRoute element={<AdminTransactions />} requiredRole={UserRole.ADMIN} />} />
        
        {/* Superadmin routes - accessible only by superadmin */}
        <Route path="/admin/settings" element={<ProtectedRoute element={<AdminSettings />} requiredRole={UserRole.SUPER_ADMIN} />} />
        
        {/* Fallback route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
  );
}

export default App;