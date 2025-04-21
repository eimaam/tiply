import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Layout components
const LandingPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQSection />
    </main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
  </>
);

// Role-based route guard component
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ 
  element, 
  requiredRole = UserRole.USER 
}: ProtectedRouteProps) => {
  // This would normally check authentication state from your auth context
  // Here we're mocking it for demonstration purposes
  const isAuthenticated = true; // Replace with actual auth check
  const userRole = UserRole.ADMIN; // Replace with actual role from user context/state
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Use utility function to check role-based access
  const hasAccess = hasRoleAccess(userRole, requiredRole);
  
  if (!hasAccess) {
    // Redirect to dashboard or show unauthorized message
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and has the required role
  return <>{element}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WaitlistPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        
       
        {/* Fallback route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;