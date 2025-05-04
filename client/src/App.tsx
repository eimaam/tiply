import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { UserRole } from '@/lib/types/user';

// Page components
import { FAQPage } from '@/pages/faq';
import { ContactPage } from '@/pages/contact';
import AboutUsPage from '@/pages/about';
import ProfilePage from '@/pages/profile';
import EditProfile from '@/pages/profile-edit';
import WaitlistPage from './pages/waitlist';
import ErrorPage from './pages/error-page';
import { message } from 'antd';




// Role-based route guard component


// Onboarding route component


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