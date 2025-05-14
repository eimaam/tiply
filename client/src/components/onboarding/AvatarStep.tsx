import * as React from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LinkOutlined, CloudUploadOutlined, InfoCircleOutlined, TwitterOutlined } from '@ant-design/icons'
import { OnboardingHeading } from './OnboardingHeading'

interface AvatarStepProps {
  profileImage: string;
  bannerImage: string;
  onProfileImageChange: (profileImage: string) => void;
  onBannerImageChange: (bannerImage: string) => void;
  username: string;
  displayName: string;
  onNext: () => void;
  onPrevious: () => void;
}

export function AvatarStep({ 
  profileImage, 
  bannerImage,
  onProfileImageChange, 
  onBannerImageChange,
  onNext, 
  onPrevious 
}: AvatarStepProps) {
  const [profilePreviewError, setProfilePreviewError] = React.useState(false)
  const [bannerPreviewError, setBannerPreviewError] = React.useState(false)
  const profileFileInputRef = React.useRef<HTMLInputElement>(null)
  const bannerFileInputRef = React.useRef<HTMLInputElement>(null)
  
  const handleProfileImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setProfilePreviewError(false)
    onProfileImageChange(url)
  }

  const handleBannerImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setBannerPreviewError(false)
    onBannerImageChange(url)
  }
  
  const handleProfileFileUploadClick = () => {
    if (profileFileInputRef.current) {
      profileFileInputRef.current.click()
    }
  }

  const handleBannerFileUploadClick = () => {
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.click()
    }
  }
  
  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const tempUrl = URL.createObjectURL(file)
      onProfileImageChange(tempUrl)
      setProfilePreviewError(false)
    }
  }

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const tempUrl = URL.createObjectURL(file)
      onBannerImageChange(tempUrl)
      setBannerPreviewError(false)
    }
  }
  
  const handleProfileImageError = () => {
    setProfilePreviewError(true)
  }

  const handleBannerImageError = () => {
    setBannerPreviewError(true)
  }

  const handleImportFromTwitter = () => {
    // Simulate importing from Twitter/X
    setTimeout(() => {
      const importedImage = 'https://example.com/twitter-avatar.jpg';
      onProfileImageChange(importedImage);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Add Your Avatar & Banner ✨" 
          subtitle="Upload profile images that represent you to your supporters" 
        />
        <p className="mt-2 text-sm text-brand-muted-foreground text-center">
          This step is optional. You can continue without adding images now and add them later.
        </p>
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear any previously set images
              onProfileImageChange('');
              onBannerImageChange('');
              
              // Create a hard timeout to force navigation if the callback doesn't work
              const forcedNavigationTimeout = setTimeout(() => {
                window.location.href = `/onboarding/customize`;
              }, 800);
              
              try {
                onNext();
                clearTimeout(forcedNavigationTimeout);
              } catch (error) {
                console.error("Error navigating from skip button:", error);
              }
            }}
            className="text-brand-primary border-brand-primary"
          >
            Skip this step
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Profile image upload area */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Avatar preview */}
          <motion.div 
            className={`w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary/30 flex items-center justify-center ${profileImage && !profilePreviewError ? 'bg-transparent' : 'bg-brand-primary/10'}`}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            {profileImage && !profilePreviewError ? (
              <img 
                src={profileImage} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
                onError={handleProfileImageError}
              />
            ) : (
              <CloudUploadOutlined className="text-4xl text-brand-primary/60" />
            )}
          </motion.div>
          
          {/* Upload methods */}
          <div className="w-full max-w-md space-y-4">
            {/* URL input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Image URL</label>
              <Input
                name="profileImage"
                type="url"
                placeholder="https://example.com/your-image.jpg"
                prefixIcon={<LinkOutlined />}
                value={profileImage}
                onChange={handleProfileImageUrlChange}
              />
            </div>
            
            {/* OR divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-brand-border"></div>
              <span className="flex-shrink mx-4 text-brand-muted-foreground">OR</span>
              <div className="flex-grow border-t border-brand-border"></div>
            </div>
            
            {/* File upload button */}
            <div className="text-center">
              <input
                ref={profileFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileFileChange}
                className="hidden"
                title="Upload profile image"
                aria-label="Upload profile image file"
              />
              <Button
                htmlType="button"
                variant="outline"
                onClick={handleProfileFileUploadClick}
                className="w-full border-dashed border-2"
              >
                <CloudUploadOutlined className="mr-2" /> Upload profile from your device
              </Button>
            </div>
            
            {/* Import from Twitter/X */}
            {/* TODO: implement feature later */}
            {/* <div className="text-center">
              <Button
                htmlType="button"
                variant="ghost"
                onClick={handleImportFromTwitter}
                className="w-full"
              >
                <TwitterOutlined className="mr-2" /> Import profile from Twitter/X
              </Button>
            </div> */}
            
            {/* Error message */}
            {profilePreviewError && (
              <p className="text-sm text-red-500 text-center mt-2">
                Couldn't load the profile image. Please try a different URL or upload a file.
              </p>
            )}
          </div>
        </div>

        {/* Banner image upload area */}
        <div className="mt-8 pt-6 border-t border-brand-border">
          <h3 className="text-lg font-medium mb-4">Banner Image (Optional)</h3>
          
          {/* Banner preview */}
          <motion.div 
            className={`w-full h-32 rounded-lg overflow-hidden border-2 border-brand-primary/20 flex items-center justify-center mb-4 ${bannerImage && !bannerPreviewError ? 'bg-transparent' : 'bg-brand-primary/5'}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {bannerImage && !bannerPreviewError ? (
              <img 
                src={bannerImage} 
                alt="Banner Preview" 
                className="w-full h-full object-cover"
                onError={handleBannerImageError}
              />
            ) : (
              <div className="text-center text-brand-muted-foreground">
                <CloudUploadOutlined className="text-3xl mb-2" />
                <p className="text-sm">Add a banner image</p>
              </div>
            )}
          </motion.div>
          
          {/* Banner image upload methods */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                name="bannerImage"
                type="url"
                placeholder="Banner image URL"
                prefixIcon={<LinkOutlined />}
                value={bannerImage}
                onChange={handleBannerImageUrlChange}
              />
            </div>
            
            <div>
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="hidden"
                title="Upload banner image"
                aria-label="Upload banner image file"
              />
              <Button
                htmlType="button"
                variant="outline"
                onClick={handleBannerFileUploadClick}
                className="w-full"
              >
                <CloudUploadOutlined className="mr-2" /> Upload banner
              </Button>
            </div>
          </div>
          
          {bannerPreviewError && (
            <p className="text-sm text-red-500 mt-2">
              Couldn't load the banner image. Please try a different URL or upload a file.
            </p>
          )}
        </div>

        {/* Info note */}
        <div className="flex items-start space-x-2 text-sm text-brand-muted-foreground">
          <InfoCircleOutlined className="text-brand-primary mt-0.5" />
          <span>Your profile images help create a personalized experience for your supporters. You can always change them later.</span>
        </div>
        
        {/* Avatar tips */}
        <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-border">
          <h3 className="text-sm font-medium mb-2">💡 Tips for great profile images</h3>
          <ul className="text-sm text-brand-muted-foreground space-y-1 list-disc pl-5">
            <li>Use high-quality images with good lighting</li>
            <li>For profile: A front-facing portrait works best for personal branding</li>
            <li>For banner: Choose an image that represents your brand or work</li>
            <li>Keep your banner clean and not too busy</li>
          </ul>
        </div>
      </div>
    </div>
  )
}