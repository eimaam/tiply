import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { InfoCircleOutlined, RocketOutlined } from '@ant-design/icons';
import PoweredBySolanaIllustration from '@/assets/images/illustrations/powered-by-solana';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { UsernameStep } from '@/components/onboarding/UsernameStep';
import { ProfileStep } from '@/components/onboarding/ProfileStep';
import { AvatarStep } from '@/components/onboarding/AvatarStep';
import { CustomizeStep } from '@/components/onboarding/CustomizeStep';
import { useUser } from '@/contexts/UserContext';
import { useOnboarding, OnboardingStep, STEP_INFO, getStepPath } from '@/contexts/OnboardingContext';

export function Onboarding() {
  const { user } = useUser();
  const { currentStep, isLoading, completeStep, skipStep } = useOnboarding();
  const navigate = useNavigate();
  const { stepName } = useParams();
  
  // Celebration state
  const [celebrationVisible, setCelebrationVisible] = React.useState(false);
  const [confetti, setConfetti] = React.useState<{ x: number, y: number, size: number, color: string }[]>([]);
  
  // Store form data for each step
  const [stepData, setStepData] = React.useState({
    // Username step
    username: user?.username || '',
    isValidUsername: false,
    isUsernameAvailable: false,
    
    // Profile step
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    socialLinks: user?.socialLinks || {},
    
    // Avatar step
    profileImage: user?.avatarUrl || '',
    bannerImage: user?.coverImageUrl || '',
    
    // Customize step
    tipAmounts: user?.tipAmounts || [1, 3, 5],
    allowCustomAmounts: true,
    receiveNotes: true,
    minimumTipAmount: 1,
    themeColor: '#7B2CBF',
    customization: user?.customization || {},
    
    // Notifications
    notificationsEnabled: false,
    notificationChannel: 'email',
    notificationEmail: user?.email || '',
    notificationTelegram: '',
  });

  // Ensure the URL matches the current step
  React.useEffect(() => {
    if (stepName && stepName !== currentStep) {
      navigate(getStepPath(currentStep), { replace: true });
    }
  }, [currentStep, stepName, navigate]);

  

  // Update step data
  const updateStepData = (field: string, value: any) => {
    setStepData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update multiple fields at once
  const updateMultipleFields = (updates: Record<string, any>) => {
    setStepData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const showCelebration = () => {
    setCelebrationVisible(true);
  };

  // Determine step info for current UI state
  const getStepInfo = () => {
    return {
      id: currentStep,
      title: STEP_INFO[currentStep]?.title || '',
      emoji: STEP_INFO[currentStep]?.emoji || '✨'
    };
  };

  // Get component index for progress indicator
  const getStepComponentIndex = () => {
    switch (currentStep) {
      case OnboardingStep.USERNAME:
        return 0;
      case OnboardingStep.PROFILE:
        return 1;
      case OnboardingStep.AVATAR:
        return 2;
      case OnboardingStep.CUSTOMIZE:
        return 3;
      default:
        return 0;
    }
  };

  const stepComponentIndex = getStepComponentIndex();
  const currentStepInfo = getStepInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-background via-brand-background to-brand-primary/5 py-12">
    
      {/* Render step components using OnboardingContext */}
      <OnboardingStepRenderer
        stepComponentIndex={stepComponentIndex}
        stepData={stepData}
        updateStepData={updateStepData}
        updateMultipleFields={updateMultipleFields}
        currentStepInfo={currentStepInfo}
      />
    </div>
  );
}

// Step renderer component to handle the different onboarding steps
interface OnboardingStepRendererProps {
  stepComponentIndex: number;
  stepData: any;
  updateStepData: (field: string, value: any) => void;
  updateMultipleFields: (updates: Record<string, any>) => void;
  currentStepInfo: { id: string; title: string; emoji: string };
}

function OnboardingStepRenderer({
  stepComponentIndex,
  stepData,
  updateStepData,
  updateMultipleFields,
  currentStepInfo
}: OnboardingStepRendererProps) {
  const { user } = useUser();
  const { currentStep, isLoading, completeStep, goToPreviousStep } = useOnboarding();
  const [isStepValid, setIsStepValid] = React.useState(false);
  
  // Handle next step action
  const handleNextStep = async () => {
    // Save the current step data to the server based on the current step
    switch(currentStep) {
      case OnboardingStep.USERNAME:
        await completeStep(currentStep, {
          username: stepData.username
        });
        break;
      case OnboardingStep.PROFILE:
        await completeStep(currentStep, {
          displayName: stepData.displayName,
          bio: stepData.bio,
        });
        break;
      case OnboardingStep.AVATAR:
        await completeStep(currentStep, {
          avatarUrl: stepData.profileImage,
          coverImageUrl: stepData.bannerImage
        });
        break;
      case OnboardingStep.CUSTOMIZE:
        await completeStep(currentStep, {
          // Send the full customization object that contains all visual and functional options
          customizaticuon: stepData.customization,
          // Also include these legacy fields for backward compatibility
          tipAmounts: stepData.customization.tipAmounts || stepData.tipAmounts,
          theme: stepData.customization.primaryColor || stepData.themeColor,
          additionalSettings: {
            allowCustomAmounts: stepData.customization.allowCustomAmounts !== undefined 
              ? stepData.customization.allowCustomAmounts 
              : stepData.allowCustomAmounts,
            receiveNotes: stepData.customization.receiveNotes !== undefined 
              ? stepData.customization.receiveNotes 
              : stepData.receiveNotes,
            minimumTipAmount: stepData.customization.minimumTipAmount || stepData.minimumTipAmount,
            // Add the additional customization options
            backgroundColor: stepData.customization.backgroundColor,
            fontFamily: stepData.customization.fontFamily,
            buttonStyle: stepData.customization.buttonStyle,
            showTipCounter: stepData.customization.showTipCounter,
            enableCustomMessage: stepData.customization.enableCustomMessage,
            defaultTipOption: stepData.customization.defaultTipOption
          }
        });
        break;
    }
  };
  
  // Handle step skipping
  const handleSkipStep = () => {
    goToPreviousStep(currentStep);
  };
  
  // Validate step based on step type
  React.useEffect(() => {
    validateStep();
  }, [stepData, currentStep]);
  
  const validateStep = () => {
    switch(currentStep) {
      case OnboardingStep.USERNAME:
        setIsStepValid(
          stepData.username !== '' && 
          stepData.isValidUsername && 
          stepData.isUsernameAvailable
        );
        break;
      case OnboardingStep.PROFILE:
        setIsStepValid(stepData.displayName !== '');
        break;
      case OnboardingStep.AVATAR:
        // Avatar is optional, always valid
        setIsStepValid(true);
        break;
      case OnboardingStep.CUSTOMIZE:
        // Customization is always valid
        setIsStepValid(true);
        break;
      default:
        setIsStepValid(false);
    }
  };
  
  return (
    <OnboardingLayout
      currentStep={stepComponentIndex}
      totalSteps={4} // We have 4 steps: username, profile, avatar, customize
      stepInfo={currentStepInfo}
      onNext={handleNextStep}
      onPrevious={handleSkipStep}
      canContinue={isStepValid}
      isLoading={isLoading}
      isLastStep={currentStep === OnboardingStep.CUSTOMIZE}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full"
        >
          {/* Username step */}
          {!user?.username && currentStep === OnboardingStep.USERNAME && (
            <UsernameStep 
              username={stepData.username}
              onUsernameChange={(username, isValid, isAvailable) => {
                updateMultipleFields({
                  username,
                  isValidUsername: isValid,
                  isUsernameAvailable: isAvailable
                });
              }}
              onNext={handleNextStep}
              onPrevious={() => {}}
            />
          )}
          
          {/* Profile step */}
          {currentStep === OnboardingStep.PROFILE && (
            <ProfileStep 
              displayName={stepData.displayName}
              bio={stepData.bio}
              onDisplayNameChange={(displayName) => {
                updateStepData('displayName', displayName);
              }
              }
              onBioChange={(bio) => {
                updateStepData('bio', bio);
              }}
              onNext={handleNextStep}
              onPrevious={handleSkipStep}
            />
          )}
          
          {/* Avatar step */}
          {currentStep === OnboardingStep.AVATAR && (
            <AvatarStep 
              profileImage={stepData.profileImage}
              bannerImage={stepData.bannerImage}
              onProfileImageChange={(profileImage) => {
                updateStepData('profileImage', profileImage);
              }}
              onBannerImageChange={(bannerImage) => {
                updateStepData('bannerImage', bannerImage);
              }}
              username={stepData.username}
              displayName={stepData.displayName}
              onNext={handleNextStep}
              onPrevious={handleSkipStep}
            />
          )}
          
          {/* Customize step */}
          {currentStep === OnboardingStep.CUSTOMIZE && (
            <CustomizeStep 
              customization={stepData.customization}
              onCustomizationChange={(customization) => {
                updateMultipleFields({
                  customization,
                  tipAmounts: customization.tipAmounts || [],
                  themeColor: customization.primaryColor || '#7B2CBF'
                });
              }}
              onNext={handleNextStep}
              onPrevious={() => {}}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}