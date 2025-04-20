import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { InfoCircleOutlined, RocketOutlined } from '@ant-design/icons'
import PoweredBySolanaIllustration from '@/assets/images/illustrations/powered-by-solana'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { UsernameStep } from '@/components/onboarding/UsernameStep'
import { ProfileStep } from '@/components/onboarding/ProfileStep'
import { AvatarStep } from '@/components/onboarding/AvatarStep'
import { WalletStep } from '@/components/onboarding/WalletStep'
import { CustomizeStep } from '@/components/onboarding/CustomizeStep'

// Enhanced multi-step onboarding process with a component-based approach
const steps = [
  { id: 'wallet', title: 'Connect Wallet', emoji: '💰' },
  { id: 'username', title: 'Username', emoji: '🔗' },
  { id: 'profile', title: 'Profile', emoji: '🧑‍🚀' },
  { id: 'avatar', title: 'Avatar', emoji: '📸' },
  { id: 'customize', title: 'Customize', emoji: '✨' },
  { id: 'notifications', title: 'Notifications', emoji: '🔔' },
]

export function Onboarding() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isStepValid, setIsStepValid] = React.useState(false)
  const [celebrationVisible, setCelebrationVisible] = React.useState(false)
  
  // Centralized state for all onboarding data
  const [onboardingData, setOnboardingData] = React.useState({
    // Wallet step
    walletConnected: false,
    walletAddress: '',
    
    // Username step
    username: '',
    isValidUsername: false,
    isUsernameAvailable: false,
    
    // Profile step
    displayName: '',
    bio: '',
    
    // Avatar step
    profileImage: '',
    bannerImage: '',
    
    // Customize step
    tipAmounts: [],
    allowCustomAmounts: true,
    receiveNotes: true,
    minimumTipAmount: 1,
    themeColor: '#7B2CBF',
    
    // Notifications step
    notificationsEnabled: false,
    notificationChannel: 'email',
    notificationEmail: '',
    notificationTelegram: '',
  })

  // Update specific onboarding data field
  const updateOnboardingData = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update multiple onboarding data fields at once
  const updateMultipleFields = (updates: Record<string, any>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates
    }))
  }

  React.useEffect(() => {
    validateCurrentStep(currentStep);
  }, [currentStep]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeSetup();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      
      // When going back, the step should be valid if already filled
      validateCurrentStep(currentStep - 1)
    }
  }
  
  // Validate the current step based on its index
  const validateCurrentStep = (stepIndex: number) => {
    console.log("Validating current step ==>", stepIndex)
    const step = steps[stepIndex].id
    
    switch (step) {
      case 'wallet':
        setIsStepValid(onboardingData.walletConnected)
        break
      case 'username':
        setIsStepValid(
          onboardingData.username !== '' && 
          onboardingData.isValidUsername && 
          onboardingData.isUsernameAvailable
        )
        break
      case 'profile':
        setIsStepValid(onboardingData.displayName !== '')
        break
      case 'avatar':
        // Avatar is optional, always valid
        setIsStepValid(true)
        break
      case 'customize':
        // Basic customization is pre-filled, so always valid
        setIsStepValid(true)
        break
      case 'notifications':
        // Notifications are optional, always valid
        setIsStepValid(true)
        break
      default:
        setIsStepValid(false)
    }
  }

  const completeSetup = async () => {
    setLoading(true)
    // Simulate profile setup
    setTimeout(() => {
      setLoading(false)
      setCelebrationVisible(true)
      // Navigate after celebration
      setTimeout(() => {
        navigate('/dashboard')
      }, 3500)
    }, 2000)
  }

  // Confetti coordinates for celebration
  const [confetti, setConfetti] = React.useState<{ x: number, y: number, size: number, color: string }[]>([])
  
  React.useEffect(() => {
    if (celebrationVisible) {
      const newConfetti = Array.from({ length: 100 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 2,
        color: ['#FF6B6B', '#4ECDC4', '#FFD166', '#118AB2', '#7B2CBF'][Math.floor(Math.random() * 5)]
      }))
      setConfetti(newConfetti)
    }
  }, [celebrationVisible])

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-background via-brand-background to-brand-primary/5 py-12">
      {/* Celebration overlay */}
      {celebrationVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Confetti */}
          {confetti.map((c, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              initial={{ 
                top: "50%",
                left: "50%",
                width: c.size,
                height: c.size,
                backgroundColor: c.color
              }}
              animate={{
                top: `${c.y}%`,
                left: `${c.x}%`,
                opacity: [1, 0.8, 0]
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
                delay: Math.random() * 0.5
              }}
            />
          ))}
          
          <motion.div 
            className="text-center p-10 rounded-2xl bg-brand-background/90 backdrop-blur-lg border border-brand-border shadow-lg max-w-lg w-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-brand-primary/80 to-brand-accent/80 rounded-full flex items-center justify-center"
            >
              <RocketOutlined className="text-white text-4xl" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-3">Your tiply is Ready! 🎉</h2>
            <p className="text-xl mb-3 text-brand-foreground">Start receiving tips now</p>
            
            <div className="bg-brand-surface/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-brand-border flex items-center justify-center">
              <span className="text-brand-primary font-medium">tiply.xyz/@</span>
              <span className="font-bold">
                {onboardingData.username}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Button variant="outline" className="flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy Link
              </Button>
              <Button variant="outline" className="flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
                Share on X
              </Button>
              <Button className="bg-gradient-to-r from-brand-primary to-brand-accent">
                Go to Dashboard
              </Button>
            </div>
            
            <p className="text-brand-muted-foreground text-sm mb-6">Taking you to your dashboard...</p>
            <div className="flex justify-center">
              <PoweredBySolanaIllustration />
            </div>
          </motion.div>
        </div>
      )}
    
      <OnboardingLayout
        currentStep={currentStep} 
        totalSteps={steps.length}
        stepInfo={steps[currentStep]}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        canContinue={isStepValid}
        isLoading={loading}
        isLastStep={currentStep === steps.length - 1}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            {/* Step 1: Wallet Connection */}
            {currentStep === 0 && (
              <WalletStep 
                walletConnected={onboardingData.walletConnected}
                walletAddress={onboardingData.walletAddress}
                onConnect={(connected, address) => {
                  updateMultipleFields({
                    walletConnected: connected,
                    walletAddress: address
                  });
                  console.log(`Wallet connected: ${connected}, Address: ${address}`);
                  setIsStepValid(connected);
                }}
                loading={loading}
                setLoading={setLoading}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
                onWalletAddressChange={(address) => updateOnboardingData('walletAddress', address)}
              />
            )}
            
            {/* Step 2: Username Selection */}
            {currentStep === 1 && (
              <UsernameStep 
                username={onboardingData.username}
                onUsernameChange={(username, isValid, isAvailable) => {
                  updateMultipleFields({
                    username,
                    isValidUsername: isValid, 
                    isUsernameAvailable: isAvailable
                  });
                  setIsStepValid(username !== '' && isValid && isAvailable);
                }}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
              />
            )}
            
            {/* Step 3: Profile Details */}
            {currentStep === 2 && (
              <ProfileStep 
                displayName={onboardingData.displayName}
                bio={onboardingData.bio}
                onDisplayNameChange={(displayName) => {
                  updateOnboardingData('displayName', displayName);
                  setIsStepValid(displayName.trim() !== '');
                }}
                onBioChange={(bio) => {
                  updateOnboardingData('bio', bio);
                }}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
              />
            )}
            
            {/* Step 4: Avatar Setup */}
            {currentStep === 3 && (
              <AvatarStep 
                profileImage={onboardingData.profileImage}
                bannerImage={onboardingData.bannerImage}
                onProfileImageChange={(url) => {
                  updateOnboardingData('profileImage', url);
                  setIsStepValid(url.trim() !== ''); // Update validity based on profileImage
                }}
                onBannerImageChange={(url) => {
                  updateOnboardingData('bannerImage', url);
                }}
                username={onboardingData.username}
                displayName={onboardingData.displayName}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
              />
            )}
            
            {/* Step 5: Customize Settings */}
            {currentStep === 4 && (
              <CustomizeStep 
                tipAmounts={onboardingData.tipAmounts}
                allowCustomAmounts={onboardingData.allowCustomAmounts}
                receiveNotes={onboardingData.receiveNotes}
                minimumTipAmount={onboardingData.minimumTipAmount}
                themeColor={onboardingData.themeColor}
                onSettingsChange={(field, value) => {
                  updateOnboardingData(field, value);
                }}
              />
            )}
            
            {/* Step 6: Notifications */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    Enable Notifications 🔔
                    <div className="group relative">
                      <InfoCircleOutlined className="text-brand-muted-foreground text-sm cursor-help" />
                      <div className="absolute left-0 -top-1 transform -translate-y-full w-64 p-3 bg-brand-surface/90 backdrop-blur-sm 
                          border border-brand-border rounded-lg shadow-lg text-sm z-10 invisible opacity-0 
                          group-hover:visible group-hover:opacity-100 transition-opacity text-left">
                        You can always change these notification settings later in your dashboard.
                      </div>
                    </div>
                  </h2>
                  <p className="text-brand-muted-foreground">
                    Get alerted when someone sends you a tip
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input 
                      type="checkbox"
                      id="enableNotifications"
                      checked={onboardingData.notificationsEnabled}
                      onChange={(e) => {
                        updateOnboardingData('notificationsEnabled', e.target.checked);
                      }}
                      className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="enableNotifications" className="ml-3 text-lg font-medium">
                      Enable tip notifications
                    </label>
                  </div>
                  
                  {onboardingData.notificationsEnabled && (
                    <div className="space-y-4 bg-brand-surface/50 rounded-lg p-4 border border-brand-border">
                      <p className="font-medium">Choose notification channel:</p>
                      
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="notificationChannel"
                            value="email"
                            checked={onboardingData.notificationChannel === 'email'}
                            onChange={() => updateOnboardingData('notificationChannel', 'email')}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                          />
                          <span className="ml-3">Email</span>
                        </label>
                        
                        {onboardingData.notificationChannel === 'email' && (
                          <div className="ml-7 mt-2">
                            <input
                              type="email"
                              placeholder="your@email.com"
                              value={onboardingData.notificationEmail}
                              onChange={(e) => updateOnboardingData('notificationEmail', e.target.value)}
                              className="w-full rounded-md border border-brand-border bg-brand-surface px-4 py-2 text-sm"
                            />
                          </div>
                        )}
                        
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="notificationChannel"
                            value="telegram"
                            checked={onboardingData.notificationChannel === 'telegram'}
                            onChange={() => updateOnboardingData('notificationChannel', 'telegram')}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                          />
                          <span className="ml-3">Telegram</span>
                        </label>
                        
                        {onboardingData.notificationChannel === 'telegram' && (
                          <div className="ml-7 mt-2">
                            <input
                              type="text"
                              placeholder="@yourusername"
                              value={onboardingData.notificationTelegram}
                              onChange={(e) => updateOnboardingData('notificationTelegram', e.target.value)}
                              className="w-full rounded-md border border-brand-border bg-brand-surface px-4 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-brand-primary/10 p-3 rounded-md border border-brand-primary/20 text-sm">
                        <p className="font-medium">You'll receive notifications when:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Someone sends you a tip</li>
                          <li>Someone leaves a note with their tip</li>
                          <li>You reach milestone amounts</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {!onboardingData.notificationsEnabled && (
                    <div className="p-4 border border-brand-border rounded-md bg-brand-muted-foreground/10 text-sm">
                      <p>You can always enable notifications later in your dashboard settings.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 7: tiply Ready */}
            {currentStep === 6 && (
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Your tiply is Ready! 🎉</h2>
                <p className="text-lg text-brand-muted-foreground">Start receiving tips now</p>

                <div className="bg-brand-surface/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-brand-border flex items-center justify-center">
                  <span className="text-brand-primary font-medium">tiply.xyz/@</span>
                  <span className="font-bold">{onboardingData.username}</span>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="outline" className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                    Copy Link
                  </Button>
                  <Button variant="outline" className="flex gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                    Share on X
                  </Button>
                  <Button className="bg-gradient-to-r from-brand-primary to-brand-accent">
                    Go to Dashboard
                  </Button>
                </div>

                <p className="text-sm text-brand-muted-foreground">Taking you to your dashboard...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </OnboardingLayout>
    </div>
  )
}