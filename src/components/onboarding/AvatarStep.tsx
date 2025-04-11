import * as React from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LinkOutlined, CloudUploadOutlined, InfoCircleOutlined } from '@ant-design/icons'
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
  onProfileImageChange, 
  onNext, 
  onPrevious 
}: AvatarStepProps) {
  const [previewError, setPreviewError] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const canContinue = profileImage && !previewError;
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreviewError(false)
    onProfileImageChange(url)
  }
  
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real implementation, you would upload this file to your server/storage
      // Here we're just creating a temporary URL for preview purposes
      const tempUrl = URL.createObjectURL(file)
      onProfileImageChange(tempUrl)
      setPreviewError(false)
    }
  }
  
  const handleImageError = () => {
    setPreviewError(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <OnboardingHeading 
          title="Add Your Avatar ✨" 
          subtitle="Upload a profile image that represents you to your supporters" 
        />
      </div>
      
      <div className="space-y-6">
        {/* Profile image upload area */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Avatar preview */}
          <motion.div 
            className={`w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary/30 flex items-center justify-center ${profileImage && !previewError ? 'bg-transparent' : 'bg-brand-primary/10'}`}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            {profileImage && !previewError ? (
              <img 
                src={profileImage} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <CloudUploadOutlined className="text-4xl text-brand-primary/60" />
            )}
          </motion.div>
          
          {/* Upload methods */}
          <div className="w-full max-w-md space-y-4">
            {/* URL input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                name="profileImage"
                type="url"
                placeholder="https://example.com/your-image.jpg"
                prefixIcon={<LinkOutlined />}
                value={profileImage}
                onChange={handleImageUrlChange}
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFileUploadClick}
                className="w-full border-dashed border-2"
              >
                <CloudUploadOutlined className="mr-2" /> Upload from your device
              </Button>
            </div>
            
            {/* Error message */}
            {previewError && (
              <p className="text-sm text-red-500 text-center mt-2">
                Couldn't load the image. Please try a different URL or upload a file.
              </p>
            )}
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start space-x-2 text-sm text-brand-muted-foreground">
          <InfoCircleOutlined className="text-brand-primary mt-0.5" />
          <span>Your avatar helps your profile feel more personal. You can always change it later.</span>
        </div>
        
        {/* Avatar tips */}
        <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-border">
          <h3 className="text-sm font-medium mb-2">💡 Tips for a great avatar</h3>
          <ul className="text-sm text-brand-muted-foreground space-y-1 list-disc pl-5">
            <li>Use a high-quality image with good lighting</li>
            <li>A front-facing portrait works best for personal branding</li>
            <li>If you're a brand or project, use your logo</li>
            <li>Make sure your face is clearly visible if using a photo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}