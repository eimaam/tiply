import * as React from 'react'
import { Input } from '@/components/ui/input'
import { InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { OnboardingHeading } from './OnboardingHeading'
import debounce from 'lodash.debounce'
import { publicApi } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'


interface UsernameStepProps {
  username: string;
  onUsernameChange: (username: string, isValid: boolean, isAvailable: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function UsernameStep({ 
  username, 
  onUsernameChange, 
  onNext, 
  onPrevious 
}: UsernameStepProps) {
  const { user } = useUser()
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null)
  const [isChecking, setIsChecking] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Auto-skip this step if user already has a username
  React.useEffect(() => {
    if (user?.username) {
      // If user already has a username, automatically proceed to next step
      onNext();
    }
  }, [user, onNext]);

  // Check if username format is valid
  const isValidFormat = React.useMemo(() => {
    if (!username) return false
    
    // Username must be 3-20 characters and only contain letters, numbers, underscores
    const validFormat = /^[a-z0-9_]{3,20}$/.test(username)
    return validFormat
  }, [username])
  
  // Create a debounced function that checks username availability
  const debouncedCheckUsername = React.useCallback(
    debounce(async (value: string) => {
      if (!value || !isValidFormat) {
        setIsAvailable(null);
        return;
      }
      
      setIsChecking(true);
      
      try {
        const response = await publicApi.get(`/auth/check-username/${value}`);
        const { available, message } = response.data.data;
        
        setIsAvailable(available);
        
        if (!available) {
          setError('This username is already taken. Please try another. 😔');
        } else {
          setError(null);
        }
        
        // Update parent component with the latest validation state
        onUsernameChange(value, isValidFormat, available);
      } catch (err) {
        console.error('Error checking username:', err);
        setError('An error occurred while checking username availability. 🤔');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 500),
    [isValidFormat, onUsernameChange]
  );
  
  // Check for reserved username in localStorage when component mounts
  React.useEffect(() => {
    const reservedUsername = localStorage.getItem('reservedUsername');
    if (reservedUsername && !username) {
      // Validate and check availability of the reserved username
      const isValidFormat = /^[a-z0-9_]{3,20}$/.test(reservedUsername);
      if (isValidFormat) {
        // Update the username in parent component
        onUsernameChange(reservedUsername, true, false);
        // Check availability
        debouncedCheckUsername(reservedUsername);
      }
      // Remove the reserved username from localStorage after using it
      localStorage.removeItem('reservedUsername');
    }
  }, [debouncedCheckUsername, username, onUsernameChange]);
  
  // Check if we can continue to next step
  const canContinue = username && isValidFormat && isAvailable === true && !isChecking;
  
  // Handle username change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    
    // Update parent with current values but mark as invalid until checked
    onUsernameChange(value, isValidFormat, false);
    
    if (value && !isValidFormat) {
      setError('Username must be 3-20 characters and only contain letters, numbers, and underscores.');
      setIsAvailable(null);
    } else {
      setError(null);
      // Only trigger API check if format is valid
      if (value && isValidFormat) {
        debouncedCheckUsername(value);
      }
    }
  };
  
  // Run username check when component mounts or username format becomes valid
  React.useEffect(() => {
    if (username && isValidFormat) {
      debouncedCheckUsername(username);
    }
  }, [isValidFormat]); // Only dependent on isValidFormat changing, not username

  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Choose Your Username 🏷️" 
          subtitle="Pick a unique username for your tiply profile" 
        />
      </div>
      
      <div className="space-y-6">
        {/* Username input */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex justify-between items-center">
            <span>Username</span>
            <span className="text-red-500 text-xs">* Required</span>
          </label>
          
          <div className="relative">
            <Input 
              name="username"
              placeholder="yourusername"
              value={username}
              onChange={handleChange}
              className={`pl-10 ${
                !username ? '' : 
                error ? 'border-red-500' : 
                isChecking ? 'border-yellow-400' : 
                isAvailable ? 'border-green-500' : ''
              }`}
              required
            />
            
            {/* Prefix @ symbol */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted-foreground">
              @
            </div>
            
            {/* Status indicator */}
            {username && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isChecking ? (
                  <span className="animate-spin text-yellow-400">⟳</span>
                ) : isAvailable ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : isAvailable === false ? (
                  <CloseCircleOutlined className="text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          {/* Success message */}
          {isAvailable && (
            <p className="text-sm text-green-500 flex items-center">
              <CheckCircleOutlined className="mr-1" /> Username is available! 🎉
            </p>
          )}
          
          {/* Info note */}
          <div className="flex items-start space-x-2 text-sm text-brand-muted-foreground">
            <InfoCircleOutlined className="text-brand-primary mt-0.5" />
            <span>Your profile will be available at tiply.xyz/@{username || 'yourusername'}. You can change this later in settings.</span>
          </div>
        </div>
        
        {/* Username tips */}
        <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-border">
          <h3 className="text-sm font-medium mb-2">💡 Tips for a good username</h3>
          <ul className="text-sm text-brand-muted-foreground space-y-1 list-disc pl-5">
            <li>Use your name, brand name, or a memorable identifier</li>
            <li>Shorter usernames are easier to share</li>
            <li>Avoid numbers at the end unless part of your brand</li>
            <li>Consider using the same username across platforms</li>
          </ul>
        </div>
      </div>
    </div>
  )
}