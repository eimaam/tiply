import React, { useState, useEffect } from 'react';
import { Form, Input, Alert, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LinkOutlined, 
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import debounce from 'lodash.debounce';
import { userService } from '@/services/user.service';
import { useUser } from '@/contexts/UserContext';
import { publicApi } from '@/lib/api';

interface ProfileSettingsProps {
  className?: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ className }) => {
  const { user, refreshUser } = useUser();
  const [form] = Form.useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'valid' | 'invalid' | 'unchanged' | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username || '',
        displayName: user.displayName || '',
        bio: user.bio || '',
        'socialLinks.twitter': user.socialLinks?.twitter || '',
        'socialLinks.instagram': user.socialLinks?.instagram || '',
        'socialLinks.youtube': user.socialLinks?.youtube || '',
        'socialLinks.website': user.socialLinks?.website || '',
      });
    }
  }, [user, form]);

  // Debounced function to check username availability
  const checkUsernameAvailability = React.useCallback(
    debounce(async (username: string) => {
      // If username is the same as current user's username, no need to check
      if (user?.username === username) {
        setUsernameStatus('unchanged');
        setUsernameError(null);
        return;
      }
      
      // Basic client-side validation
      if (!username || username.length < 3) {
        setUsernameStatus('invalid');
        setUsernameError('Username must be at least 3 characters');
        return;
      }
      
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        setUsernameStatus('invalid');
        setUsernameError('Username must be 3-20 characters and only contain lowercase letters, numbers, and underscores');
        return;
      }
      
      try {
        setIsCheckingUsername(true);
        setUsernameStatus('checking');
        
        const response = await publicApi.get(`/auth/check-username/${username}`);
        const { available, message } = response.data.data;
        
        if (available) {
          setUsernameStatus('valid');
          setUsernameError(null);
        } else {
          setUsernameStatus('invalid');
          setUsernameError(message || 'This username is already taken. Please try another. 😔');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameStatus('invalid');
        setUsernameError('An error occurred while checking username availability. 🤔');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500),
    [user]
  );

  // Handler for username field changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase();
    
    if (!username) {
      setUsernameStatus(null);
      setUsernameError(null);
      return;
    }
    
    if (username === user?.username) {
      setUsernameStatus('unchanged');
      setUsernameError(null);
      return;
    }
    
    setUsernameStatus('checking');
    checkUsernameAvailability(username);
  };

  // Handle profile update submission
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // If username is being checked or is invalid, prevent submission
      if (isCheckingUsername || (usernameStatus === 'invalid' && values.username !== user?.username)) {
        setError('Please fix the username issues before submitting');
        setIsSubmitting(false);
        return;
      }
      
      // Clean up social links to only use usernames, not full URLs
      const socialLinks = {
        twitter: values.socialLinks?.twitter ? values.socialLinks.twitter.replace(/^(https?:\/\/)?(www\.)?(twitter\.com\/)?@?/i, '') : '',
        instagram: values.socialLinks?.instagram ? values.socialLinks.instagram.replace(/^(https?:\/\/)?(www\.)?(instagram\.com\/)?@?/i, '') : '',
        youtube: values.socialLinks?.youtube ? values.socialLinks.youtube.replace(/^(https?:\/\/)?(www\.)?(youtube\.com\/)?(@|c\/|channel\/)?/i, '') : '',
        website: values.socialLinks?.website, // Keep website as full URL
      };
      
      const updatedProfile = await userService.updateProfile({
        username: values.username,
        displayName: values.displayName,
        bio: values.bio,
        socialLinks,
      });
      
      // Update user context with the new profile data
      if (refreshUser) {
        await refreshUser();
      }
      
      setSuccessMessage('Profile updated successfully! ✨');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error?.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render username status indicator
  const renderUsernameStatus = () => {
    if (!form.getFieldValue('username')) return null;
    
    switch (usernameStatus) {
      case 'checking':
        return <LoadingOutlined className="text-brand-muted-foreground animate-spin" />;
      case 'valid':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'invalid':
        return <CloseCircleOutlined className="text-red-500" />;
      case 'unchanged':
        return form.getFieldValue('username') === user?.username ? 
          <CheckCircleOutlined className="text-green-500" /> : null;
      default:
        return null;
    }
  };

  return (
    <DashboardCard 
      title="Profile Settings"
      description="Customize your public profile information"
      className={className}
    >
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error"
          className="mb-4" 
          showIcon 
          closable
          onClose={() => setError('')}
        />
      )}
      
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Alert 
            message="Success"
            description={successMessage} 
            type="success" 
            className="mb-4" 
            showIcon 
            closable
            onClose={() => setSuccessMessage('')}
          />
        </motion.div>
      )}
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          username: user?.username || '',
          displayName: user?.displayName || '',
          bio: user?.bio || '',
          'socialLinks.twitter': user?.socialLinks?.twitter || '',
          'socialLinks.instagram': user?.socialLinks?.instagram || '',
          'socialLinks.youtube': user?.socialLinks?.youtube || '',
          'socialLinks.website': user?.socialLinks?.website || '',
        }}
        onFinish={handleSubmit}
        className="space-y-6"
      >
        {/* Username Field */}
        <Form.Item 
          label={
            <div className="flex items-center">
              <span>Username</span>
              <Tooltip title="Your unique @username for your tiply profile">
                <QuestionCircleOutlined className="ml-2 text-brand-muted-foreground" />
              </Tooltip>
            </div>
          }
          name="username"
          validateStatus={usernameStatus === 'invalid' ? 'error' : undefined}
          help={usernameError}
          required
        >
          <Input 
            prefix={<UserOutlined />}
            placeholder="yourusername" 
            onChange={handleUsernameChange}
            addonBefore="@"
            className={`${
              !usernameStatus ? '' : 
              usernameStatus === 'invalid' ? 'border-red-500' : 
              usernameStatus === 'checking' ? 'border-yellow-400' : 
              usernameStatus === 'valid' ? 'border-green-500' : ''
            }`}
            suffix={renderUsernameStatus()}
          />
        </Form.Item>
        
        {/* Display Name */}
        <Form.Item
          label="Display Name"
          name="displayName"
          rules={[
            { max: 50, message: 'Display name cannot exceed 50 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Your display name"
          />
        </Form.Item>
        
        {/* Bio */}
        <Form.Item
          label="Bio"
          name="bio"
          rules={[
            { max: 200, message: 'Bio cannot exceed 200 characters' }
          ]}
        >
          <Textarea
            placeholder="Tell others a bit about yourself..."
            className="resize-y min-h-[100px]"
          />
        </Form.Item>
        
        <div className="border-t border-brand-border pt-6">
          <h3 className="text-lg font-medium mb-4">Social Links</h3>
          <p className="text-sm text-brand-muted-foreground mb-4">
            Add your social media usernames below (just the username, not the full URL)
          </p>
          
          {/* Twitter Username */}
          <Form.Item
            label={
              <div className="flex items-center">
                <TwitterOutlined className="mr-2 text-[#1DA1F2]" />
                <span>Twitter</span>
              </div>
            }
            name="socialLinks.twitter"
          >
            <Input
              placeholder="username (without @)"
              addonBefore="@"
            />
          </Form.Item>
          
          {/* Instagram Username */}
          <Form.Item
            label={
              <div className="flex items-center">
                <InstagramOutlined className="mr-2 text-[#E1306C]" />
                <span>Instagram</span>
              </div>
            }
            name="socialLinks.instagram"
          >
            <Input
              placeholder="username (without @)"
              addonBefore="@"
            />
          </Form.Item>
          
          {/* YouTube Username/Channel */}
          <Form.Item
            label={
              <div className="flex items-center">
                <YoutubeOutlined className="mr-2 text-[#FF0000]" />
                <span>YouTube</span>
              </div>
            }
            name="socialLinks.youtube"
          >
            <Input
              placeholder="channel username"
              addonBefore="@"
            />
          </Form.Item>
          
          {/* Website (Full URL) */}
          <Form.Item
            label={
              <div className="flex items-center">
                <LinkOutlined className="mr-2" />
                <span>Website</span>
              </div>
            }
            name="socialLinks.website"
            rules={[
              {
                type: 'url',
                message: 'Please enter a valid URL',
              },
            ]}
          >
            <Input
              placeholder="https://your-website.com"
              addonBefore="https://"
            />
          </Form.Item>
        </div>
        
        <Form.Item className="mt-8">
          <Button
            htmlType="submit"
            size="lg"
            className="w-full md:w-auto"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </Form.Item>
      </Form>
    </DashboardCard>
  );
};