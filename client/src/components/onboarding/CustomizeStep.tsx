import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InfoCircleOutlined } from '@ant-design/icons';
import { OnboardingHeading } from './OnboardingHeading';
import { Select, Switch } from 'antd';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStep } from '@/lib/types/user';

interface TipOption {
  amount: number;
  label?: string;
  isDefault?: boolean;
}

interface CustomizationData {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: string;
  showTipCounter?: boolean;
  enableCustomMessage?: boolean;
  tipOptions?: TipOption[];
  minimumTipAmount?: number;
  allowCustomAmounts?: boolean;
  receiveNotes?: boolean;
  customCss?: string;
}

// Support both direct props and nested customization object
interface CustomizeStepProps {
  // Direct props approach
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: string;
  showTipCounter?: boolean;
  enableCustomMessage?: boolean;
  tipOptions?: TipOption[];
  minimumTipAmount?: number;
  allowCustomAmounts?: boolean;
  receiveNotes?: boolean;
  onSettingsChange?: (field: string, value: any) => void;
  
  // Nested customization approach
  customization?: CustomizationData;
  onCustomizationChange?: (customization: CustomizationData) => void;
  
  // Navigation controls
  onNext?: () => void;
  onPrevious?: () => void;
}

const DEFAULT_TIP_AMOUNTS = [1, 2, 5, 10, 20];
const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
];
const BUTTON_STYLES = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'square', label: 'Square' },
];

export function CustomizeStep({
  // Direct props with defaults
  primaryColor: directPrimaryColor = '#6366F1',
  backgroundColor: directBackgroundColor = '#FFFFFF',
  fontFamily: directFontFamily = 'Inter',
  buttonStyle: directButtonStyle = 'rounded',
  showTipCounter: directShowTipCounter = true,
  enableCustomMessage: directEnableCustomMessage = true,
  tipOptions: directTipOptions = [],
  minimumTipAmount: directMinimumTipAmount = 1,
  allowCustomAmounts: directAllowCustomAmounts = true,
  receiveNotes: directReceiveNotes = true,
  onSettingsChange,
  
  // Nested customization object
  customization = {},
  onCustomizationChange,
  
  // Navigation
  onNext,
  onPrevious,
}: CustomizeStepProps) {
  // Access the onboarding context
  const { completeStep, goToPreviousStep, isLoading } = useOnboarding();
  
  // Use either direct props or nested customization object
  const primaryColor = customization?.primaryColor ?? directPrimaryColor;
  const backgroundColor = customization?.backgroundColor ?? directBackgroundColor;
  const fontFamily = customization?.fontFamily ?? directFontFamily;
  const buttonStyle = customization?.buttonStyle ?? directButtonStyle;
  const showTipCounter = customization?.showTipCounter ?? directShowTipCounter;
  const enableCustomMessage = customization?.enableCustomMessage ?? directEnableCustomMessage;
  const tipOptions = customization?.tipOptions ?? directTipOptions;
  const minimumTipAmount = customization?.minimumTipAmount ?? directMinimumTipAmount;
  const allowCustomAmounts = customization?.allowCustomAmounts ?? directAllowCustomAmounts;
  const receiveNotes = customization?.receiveNotes ?? directReceiveNotes;

  // Initialize with default tip options if none exist
  React.useEffect(() => {
    if (tipOptions.length === 0 && onCustomizationChange) {
      const defaultOptions = DEFAULT_TIP_AMOUNTS.slice(0, 4).map((amount, index) => ({
        amount,
        isDefault: index === 1 // Make the second option default
      }));
      
      handleChange('tipOptions', defaultOptions);
    }
  }, []);

  // Handle changes based on which prop pattern is used
  const handleChange = (field: string, value: any) => {
    if (onSettingsChange) {
      // Direct prop pattern
      onSettingsChange(field, value);
    } else if (onCustomizationChange) {
      // Nested customization pattern
      onCustomizationChange({
        ...customization,
        [field]: value,
      });
    }
  };
  
  const handleTipOptionChange = (amount: number) => {
    const existingIndex = tipOptions.findIndex(option => option.amount === amount);
    
    if (existingIndex === -1 && tipOptions.length < 5) {
      // Add new option
      handleChange('tipOptions', [...tipOptions, { amount, isDefault: false }]);
    } else if (existingIndex !== -1) {
      // Remove existing option
      handleChange('tipOptions', tipOptions.filter(option => option.amount !== amount));
    }
  };

  const handleSetDefaultTip = (amount: number) => {
    const updatedOptions = tipOptions.map(option => ({
      ...option,
      isDefault: option.amount === amount
    }));
    handleChange('tipOptions', updatedOptions);
  };

  // Get selected tip amounts from tipOptions
  const selectedTipAmounts = tipOptions.map(option => option.amount);
  
  // Get default tip amount
  const defaultTip = tipOptions.find(option => option.isDefault)?.amount;

  // Handle next button click - complete the step
  const handleNext = async () => {
    // Create the step data structure from our customization values
    const stepData = {
      tipAmounts: selectedTipAmounts,
      theme: primaryColor, // Store primary color as theme
      additionalSettings: {
        backgroundColor,
        fontFamily,
        buttonStyle,
        showTipCounter,
        enableCustomMessage,
        minimumTipAmount,
        allowCustomAmounts,
        receiveNotes,
        defaultTip
      }
    };

    // Call the completeStep function from context
    await completeStep(OnboardingStep.CUSTOMIZE, stepData);
    
    // Also call the onNext prop if provided
    if (onNext) {
      onNext();
    }
  };

  // Handle previous button click
  const handlePrevious = async () => {
    await goToPreviousStep(OnboardingStep.CUSTOMIZE);
    
    // Also call the onPrevious prop if provided
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Customize Your tiply ✨" 
          subtitle="Set your default tip preferences and customize your tiply experience." 
        />
      </div>

      <div className="space-y-6">
        {/* Theme Colors */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="h-10 w-10 rounded border-none"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="w-full"
              placeholder="#6366F1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="h-10 w-10 rounded border-none"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Font Family</label>
          <Select
            value={fontFamily}
            onChange={(value) => handleChange('fontFamily', value)}
            options={FONT_OPTIONS}
            className="w-full"
            placeholder="Select a font"
          />
        </div>

        {/* Button Style */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Button Style</label>
          <Select
            value={buttonStyle}
            onChange={(value) => handleChange('buttonStyle', value)}
            options={BUTTON_STYLES}
            className="w-full"
            placeholder="Select a button style"
          />
        </div>

        {/* Tip Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tip Options (Select up to 5)</label>
          <div className="grid grid-cols-5 gap-2">
            {DEFAULT_TIP_AMOUNTS.map(amount => (
              <Button
                key={amount}
                onClick={() => handleTipOptionChange(amount)}
                variant={selectedTipAmounts.includes(amount) ? 'default' : 'outline'}
                className={selectedTipAmounts.includes(amount) ? 'bg-primary text-white' : ''}
              >
                ${amount}
              </Button>
            ))}
          </div>
          
          {selectedTipAmounts.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium">Default Tip (Preselected)</label>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {selectedTipAmounts.map(amount => (
                  <Button
                    key={amount}
                    onClick={() => handleSetDefaultTip(amount)}
                    variant={defaultTip === amount ? 'default' : 'outline'}
                    className={defaultTip === amount ? 'bg-accent text-accent-foreground' : ''}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Show Tip Counter</label>
              <p className="text-xs text-gray-500">Display a count of received tips</p>
            </div>
            <Switch
              checked={showTipCounter}
              onChange={(checked) => handleChange('showTipCounter', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable Custom Messages</label>
              <p className="text-xs text-gray-500">Allow tippers to leave a message</p>
            </div>
            <Switch
              checked={enableCustomMessage}
              onChange={(checked) => handleChange('enableCustomMessage', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Allow Custom Amounts</label>
              <p className="text-xs text-gray-500">Let tippers enter any amount</p>
            </div>
            <Switch
              checked={allowCustomAmounts}
              onChange={(checked) => handleChange('allowCustomAmounts', checked)}
            />
          </div>
          
          {allowCustomAmounts && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Tip Amount</label>
              <Input
                type="number"
                value={minimumTipAmount}
                onChange={(e) => handleChange('minimumTipAmount', parseFloat(e.target.value))}
                className="w-full"
                placeholder="1"
                min={1}
                step={1}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Receive Notes</label>
              <p className="text-xs text-gray-500">Allow tippers to leave notes with tips</p>
            </div>
            <Switch
              checked={receiveNotes}
              onChange={(checked) => handleChange('receiveNotes', checked)}
            />
          </div>
        </div>
      </div>

    </div>
  );
}