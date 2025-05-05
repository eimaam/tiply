import { privateApi } from '@/lib/api';
import { OnboardingStep, StepData } from '@/contexts/OnboardingContext';

class OnboardingService {
  /**
   * Save wallet information during onboarding
   */
  async saveWallet(data: StepData) {
    const response = await privateApi.post('/auth/onboarding/wallet', {
      walletAddress: data.walletAddress,
      step: OnboardingStep.WALLET, // Send step identifier to backend
    });
    return response.data;
  }

  /**
   * Save username during onboarding
   */
  async saveUsername(data: StepData) {
    const response = await privateApi.post('/auth/onboarding/username', {
      username: data.username,
      step: OnboardingStep.USERNAME, // Send step identifier to backend
    });
    return response.data;
  }

  /**
   * Save profile information during onboarding
   */
  async saveProfile(data: StepData) {
    const response = await privateApi.post('/auth/onboarding/profile', {
      displayName: data.displayName,
      bio: data.bio,
      step: OnboardingStep.PROFILE, // Send step identifier to backend
    });
    return response.data;
  }

  /**
   * Save avatar and cover image during onboarding
   */
  async saveAvatar(data: StepData) {
    const response = await privateApi.post('/auth/onboarding/avatar', {
      avatarUrl: data.avatarUrl,
      coverImageUrl: data.coverImageUrl,
      step: OnboardingStep.AVATAR, // Send step identifier to backend
    });
    return response.data;
  }

  /**
   * Save customization preferences during onboarding
   */
  async saveCustomization(data: StepData) {
    const response = await privateApi.post('/auth/onboarding/customization', {
      tipAmounts: data.tipAmounts,
      theme: data.theme,
      additionalSettings: data.additionalSettings,
      step: OnboardingStep.CUSTOMIZATION, // Send step identifier to backend
    });
    return response.data;
  }

  /**
   * Complete the onboarding process
   */
  async completeOnboarding() {
    const response = await privateApi.post('/auth/onboarding/complete');
    return response.data;
  }
  
  /**
   * Get the current onboarding status
   */
  async getOnboardingStatus() {
    const response = await privateApi.get('/user/onboarding/status');
    return response.data;
  }

  /**
   * Skip a step in the onboarding process
   */
  async skipStep(stepIdentifier: string) {
    const response = await privateApi.post('/user/onboarding/skip', { 
      step: stepIdentifier 
    });
    return response.data;
  }
}

export const onboardingService = new OnboardingService();