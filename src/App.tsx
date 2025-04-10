import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Landing page components
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Pricing } from '@/components/landing/pricing'
import { FAQSection } from '@/components/faq/faq-section'
import { Footer } from '@/components/landing/footer'

// Auth components
import { Login } from '@/pages/auth/login'
import { SignUp } from '@/pages/auth/signup'
import { Onboarding } from '@/pages/auth/onboarding'

// Dashboard components
import { Dashboard } from '@/pages/dashboard'
import { TipPage } from '@/pages/tip'

// Page components
import { FAQPage } from '@/pages/faq'
import { ContactPage } from '@/pages/contact'
import AboutUsPage from '@/pages/about'

// Layout components
const LandingPage = () => (
  <div className="min-h-screen ">
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
)

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
  </>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/t/:username" element={<TipPage />} />
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
        <Route path="/onboarding" element={
          <AuthLayout>
            <Onboarding />
          </AuthLayout>
        } />

        {/* Protected routes - would include auth check in real app */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/*" element={<Dashboard />} />

        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App