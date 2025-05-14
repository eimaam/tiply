import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { InfoCircleOutlined } from '@ant-design/icons'
import { OnboardingHeading } from './OnboardingHeading'

interface ProfileStepProps {
  displayName: string
  onDisplayNameChange: (name: string) => void
  bio: string
  onBioChange: (bio: string) => void
  onNext: () => void
  onPrevious: () => void
}

export function ProfileStep({ 
  displayName, 
  onDisplayNameChange, 
  bio, 
  onBioChange, 
  onNext, 
  onPrevious 
}: ProfileStepProps) {
  // Track if the form has been interacted with
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [displayNameValue, setDisplayNameValue] = React.useState(displayName || '');
  const [bioValue, setBioValue] = React.useState(bio || '');
  
  // Initialize the component with pre-filled values if they exist
  React.useEffect(() => {
    if (displayName?.trim() || bio?.trim()) {
      setHasInteracted(true);
    }
    // Set initial values
    setDisplayNameValue(displayName || '');
    setBioValue(bio || '');
  }, [displayName, bio]);

  // Check if we can continue to next step - only display name is required
  const canContinue = displayNameValue.trim().length >= 2 && hasInteracted;

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayNameValue(value);
    setHasInteracted(true);
    onDisplayNameChange(value);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBioValue(value);
    setHasInteracted(true);
    if (value.length <= 140) {
      onBioChange(value);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Complete Your Profile 👤" 
          subtitle="Tell us more about yourself so people can find and recognize you" 
        />
      </div>
      
      <div className="space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between items-center">
            <span>Display Name</span>
            <span className="text-red-500 text-xs">* Required</span>
          </label>
          <Input 
            name="displayName"
            placeholder="Your name or brand"
            value={displayNameValue}
            onChange={handleDisplayNameChange}
            required
            className={displayNameValue.trim().length < 2 ? 'border-red-500' : ''}
            autoFocus
          />
          {(hasInteracted && displayNameValue.trim().length < 2) && (
            <p className="text-sm text-red-500">Display name must be at least 2 characters</p>
          )}
          <div className="flex items-start space-x-2 text-sm text-brand-muted-foreground">
            <InfoCircleOutlined className="text-brand-primary mt-0.5" />
            <span>This is the name that will be shown on your profile and in search results.</span>
          </div>
        </div>
        
        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between items-center">
            <span>Bio</span>
            <span className="text-gray-500 text-xs">Optional</span>
          </label>
          <Textarea 
            name="bio"
            placeholder="Tell others about yourself, your work, or your interests..."
            value={bioValue}
            onChange={handleBioChange}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-between text-xs text-brand-muted-foreground">
            <div className="flex items-start space-x-2">
              <InfoCircleOutlined className="text-brand-primary mt-0.5" />
              <span>A brief description about yourself that appears on your profile.</span>
            </div>
            <span>{bioValue.length}/140</span>
          </div>
        </div>
        
        {/* Profile tips */}
        <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-border">
          <h3 className="text-sm font-medium mb-2">💡 Profile Tips</h3>
          <ul className="text-sm text-brand-muted-foreground space-y-1 list-disc pl-5">
            <li>Use your real name or your brand name for better recognition</li>
            <li>Add a bio that explains what you do and what content you create</li>
            <li>Keep your bio concise but informative</li>
          </ul>
        </div>
      </div>
    </div>
  )
}