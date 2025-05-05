import { useState } from 'react';
import { message } from 'antd';
import { useOnboarding, OnboardingStep, StepData } from '@/contexts/OnboardingContext';

interface UseOnboardingStepProps {
  step: OnboardingStep;
  validateFn?: (data: StepData) => string | null;
  initialData?: StepData;
}

/**
 * Custom hook for handling onboarding step operations
 * @param step - The current onboarding step
 * @param validateFn - Optional validation function for the step
 * @param initialData - Optional initial data for the form
 */
export const useOnboardingStep = ({ 
  step, 
  validateFn,
  initialData = {} 
}: UseOnboardingStepProps) => {
  const [formData, setFormData] = useState<StepData>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { isLoading, saveStepData, completeStep, skipStep } = useOnboarding();

  /**
   * Handle form input changes
   * @param field - The field name to update
   * @param value - The new value
   */
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  /**
   * Update multiple form fields at once
   * @param updates - Object with field/value pairs to update
   */
  const updateFields = (updates: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear errors for updated fields
    const updatedErrors = { ...errors };
    Object.keys(updates).forEach(field => {
      if (updatedErrors[field]) delete updatedErrors[field];
    });
    setErrors(updatedErrors);
  };

  /**
   * Validate form data
   * @param data - The data to validate
   * @returns boolean indicating if validation passed
   */
  const validate = (data: StepData): boolean => {
    // Clear all errors
    setErrors({});
    
    // Run custom validation if provided
    if (validateFn) {
      const errorMsg = validateFn(data);
      if (errorMsg) {
        message.error(errorMsg);
        return false;
      }
    }
    
    return true;
  };

  /**
   * Save current step data without advancing to next step
   * @returns Promise<boolean> - True if successful
   */
  const saveProgress = async (): Promise<boolean> => {
    try {
      if (!validate(formData)) {
        return false;
      }
      
      await saveStepData(step, formData);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Submit form data and advance to the next step
   * @returns Promise<boolean> - True if successful
   */
  const submitStep = async (): Promise<boolean> => {
    try {
      if (!validate(formData)) {
        return false;
      }
      
      await completeStep(step, formData);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Skip the current step and move to the next one
   * @returns Promise<boolean> - True if successful
   */
  const skipCurrentStep = async (): Promise<boolean> => {
    try {
      await skipStep(step);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    handleChange,
    updateFields,
    saveProgress,
    submitStep,
    skipCurrentStep
  };
};