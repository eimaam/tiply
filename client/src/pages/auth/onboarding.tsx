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
import { privateApi } from '@/lib/api';
import { message } from 'antd';

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
    defaultTipAmounts: [1, 3, 5],
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
    const currentStepKey = currentStep as keyof typeof STEP_INFO;
    return {
      id: currentStep,
      title: STEP_INFO[currentStepKey]?.title || '',
      emoji: STEP_INFO[currentStepKey]?.emoji || '✨'
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
  const [hasProfileBeenEdited, setHasProfileBeenEdited] = React.useState(false);
  const navigate = useNavigate();
  
  // Handle next step action
  const handleNextStep = async () => {
    try {
      // Save the current step data to the server based on the current step
      switch(currentStep) {
        case OnboardingStep.USERNAME:
          await completeStep(currentStep, {
            username: stepData.username
          });
          // Reset the profile edited flag when moving to profile step
          setHasProfileBeenEdited(false);
          break;
        case OnboardingStep.PROFILE:
          await completeStep(currentStep, {
            displayName: stepData.displayName,
            bio: stepData.bio,
          });
          break;
        case OnboardingStep.AVATAR:
          // Make a direct API call without validation since avatar is optional
          try {
            // Only pass data if not empty
            const avatarData: any = {};
            if (stepData.profileImage) avatarData.avatarUrl = stepData.profileImage;
            if (stepData.bannerImage) avatarData.coverImageUrl = stepData.bannerImage;
            
            const response = await privateApi.post('/auth/onboarding/avatar', avatarData);
            console.log('Avatar step completed', response.data);
            
            // Always navigate to customization step after avatar
            navigate(`/onboarding/${OnboardingStep.CUSTOMIZE}`, { replace: true });
          } catch (error) {
            console.error('Error saving avatar data:', error);
            // Still navigate to next step even if saving fails
            navigate(`/onboarding/${OnboardingStep.CUSTOMIZE}`, { replace: true });
          }
          break;
        case OnboardingStep.CUSTOMIZE:
          const customizationData = {
            ...stepData.customization,
            tipOptions: stepData.customization.tipOptions || 
              stepData.defaultTipAmounts.map((amount: number, index: number) => ({
                amount,
                isDefault: index === 0
              }))
          };
          
          console.log('Customization data before sending:', customizationData);
          
          // Send customization data directly to the API, not nested under additionalSettings
          try {
            // Send direct API call to ensure proper data format
            const response = await privateApi.post('/auth/onboarding/customization', customizationData);
            console.log('Customization response:', response.data);
            
            // Proceed with context step completion
            await completeStep(currentStep, {
              customization: customizationData
            });
          } catch (error) {
            console.error('Error saving customization:', error);
            message.error('There was a problem saving your customization settings');
          }
          break;
      }
    } catch (error) {
      console.error("Error handling next step:", error);
    }
  };
  
  // Handle step skipping
  const handleSkipStep = () => {
    // Get the previous step index
    const prevStepIndex = stepComponentIndex > 0 ? stepComponentIndex - 1 : 0;
    
    // Map step index back to the enum value
    let prevStep;
    switch(prevStepIndex) {
      case 0:
        prevStep = OnboardingStep.USERNAME;
        break;
      case 1:
        prevStep = OnboardingStep.PROFILE;
        break;
      case 2:
        prevStep = OnboardingStep.AVATAR;
        break;
      case 3:
        prevStep = OnboardingStep.CUSTOMIZE;
        break;
      default:
        prevStep = OnboardingStep.USERNAME;
    }
    
    // Directly navigate to the previous step
    navigate(getStepPath(prevStep), { replace: true });
  };
  
  // Validate step based on step type
  React.useEffect(() => {
    validateStep();
  }, [stepData, currentStep, hasProfileBeenEdited]);
  
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
        // Check if display name is valid, regardless of whether it's been edited or pre-filled
        const hasValidDisplayName = stepData.displayName.trim().length >= 2;
        
        // Only validate as true if the display name is valid AND either:
        // 1. The profile has been explicitly edited by the user, or
        // 2. The display name was already pre-filled from the server (user set it previously)
        const wasPreFilled = user?.displayName && user.displayName === stepData.displayName ? true : false;
        
        setIsStepValid(hasValidDisplayName && (hasProfileBeenEdited || wasPreFilled));
        break;
      case OnboardingStep.AVATAR:
        // Avatar is completely optional, always set as valid
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
  
  // When profile fields are updated, mark the profile as edited
  const handleProfileFieldsUpdate = (field: string, value: any) => {
    updateStepData(field, value);
    if (currentStep === OnboardingStep.PROFILE) {
      setHasProfileBeenEdited(true);
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
                handleProfileFieldsUpdate('displayName', displayName);
              }}
              onBioChange={(bio) => {
                handleProfileFieldsUpdate('bio', bio);
              }}
              onNext={() => {
                handleNextStep();
              }}
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
              onNext={async () => {
                try {
                  // Save avatar data (or empty data) first
                  const avatarData: any = {};
                  if (stepData.profileImage) avatarData.avatarUrl = stepData.profileImage;
                  if (stepData.bannerImage) avatarData.coverImageUrl = stepData.bannerImage;
                  
                  setIsStepValid(false); // Disable buttons during processing
                  
                  // Make the API call
                  await privateApi.post('/auth/onboarding/avatar', avatarData);
                  message.success('Moving to customization step...', 1);
                  
                  // Force navigation to the next step
                  setTimeout(() => {
                    // First update the currentStep in context
                    navigate(`/onboarding/${OnboardingStep.CUSTOMIZE}`, { replace: true });
                    
                    // If still on the same page after 500ms, force a refresh
                    setTimeout(() => {
                      if (window.location.pathname.includes('/avatar')) {
                        window.location.href = `/onboarding/${OnboardingStep.CUSTOMIZE}`;
                      }
                    }, 500);
                  }, 100);
                } catch (error) {
                  console.error('Error saving avatar:', error);
                  message.error('Had trouble saving avatar, but continuing anyway');
                  
                  // Still navigate even on error
                  setTimeout(() => {
                    navigate(`/onboarding/${OnboardingStep.CUSTOMIZE}`, { replace: true });
                  }, 100);
                }
              }}
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