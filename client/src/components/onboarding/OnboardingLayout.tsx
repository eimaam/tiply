import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeftOutlined, ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons'
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useUser } from '@/contexts/UserContext';
import { OnboardingCompleteModal } from './OnboardingCompleteModal';

// Step type definition
export type OnboardingStep = {
  id: string
  title: string
  emoji: string
}

// Layout props type
interface OnboardingLayoutProps {
  currentStep: number
  totalSteps: number
  stepInfo: {
    id: string
    title: string
    emoji: string
  }
  onNext: () => void
  onPrevious: () => void
  canContinue?: boolean
  isLoading?: boolean
  isLastStep?: boolean
  children: React.ReactNode
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function OnboardingLayout({ 
  currentStep, 
  totalSteps,
  stepInfo,
  onNext,
  onPrevious,
  canContinue = true,
  isLoading = false,
  isLastStep = false,
  children 
}: OnboardingLayoutProps) {
  // Get the canGoBack flag and modal state from the onboarding context
  const { canGoBack, showCompletionModal, closeCompletionModal } = useOnboarding();
  // Get the user data from the user context
  const { user } = useUser();

  return (
    <div className="container max-w-2xl mx-auto px-4">
      {/* Render the completion modal when showCompletionModal is true */}
      <OnboardingCompleteModal 
        visible={showCompletionModal} 
        onClose={closeCompletionModal}
        username={user?.username || ''}
      />
      
      <motion.div 
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header with step indicator */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 p-3 rounded-full">
              <span className="text-2xl">{stepInfo?.emoji}</span>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold">Set up your tiply</h1>
              <p className="text-brand-muted-foreground">Step {currentStep + 1}: {stepInfo?.title}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-3 bg-brand-border/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Content container */}
        <motion.div
          variants={itemVariants}
          className="bg-brand-surface/80 backdrop-blur-sm shadow-xl rounded-2xl border border-brand-border p-8"
        >
          {children}
          
          {/* Navigation buttons */}
          <div className="mt-10 flex justify-between items-center">
            {/* Only show back button if canGoBack is true */}
            {canGoBack ? (
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading || currentStep === 0}
                className={`${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowLeftOutlined className="mr-2" />
                Back
              </Button>
            ) : (
              <div></div> // Empty div to maintain layout when back button is hidden
            )}
            
            <div className="flex items-center gap-3">
              {/* Step indicators */}
              <div className="hidden sm:flex space-x-2 mr-6">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index < currentStep 
                        ? "bg-brand-primary" 
                        : index === currentStep 
                          ? "bg-brand-accent" 
                          : "bg-brand-border"
                    }`}
                    whileHover={{ scale: 1.5 }}
                  />
                ))}
              </div>
              
              <Button
                onClick={onNext}
                disabled={!canContinue || isLoading}
                className={
                  isLastStep 
                    ? "bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90"
                    : ""
                }
              >
                {isLoading ? (
                  <>
                    <LoadingOutlined className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isLastStep ? "Complete Setup" : "Continue"}
                    <ArrowRightOutlined className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Powered by footer */}
        <motion.div 
          variants={itemVariants} 
          className="mt-8 flex justify-center"
        >
          <div className="text-sm text-brand-muted-foreground flex items-center gap-2">
            <span>Powered by Solana</span>
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.0025 10.8254L13.5408 5H5L11.4305 10.8254H20.0025Z" fill="currentColor"/>
              <path d="M20.0025 21.1747H11.4305L5 27.0001H13.5408L20.0025 21.1747Z" fill="currentColor"/>
              <path d="M20.0025 16.0001L13.5408 10.8254H5L11.4305 16.0001L5 21.1747H13.5408L20.0025 16.0001Z" fill="currentColor"/>
              <path d="M25.3229 16.0001L18.8613 10.8254H10.3205L16.751 16.0001L10.3205 21.1747H18.8613L25.3229 16.0001Z" fill="currentColor"/>
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}