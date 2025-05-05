import { FAQSection } from '@/components/faq/faq-section'
import { Features } from '@/components/landing/features'
import { Footer } from '@/components/landing/footer'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Navbar } from '@/components/landing/navbar'
import { Pricing } from '@/components/landing/pricing'
import React from 'react'

const Homepage = () => {
  return (
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
  )
}

export default Homepage