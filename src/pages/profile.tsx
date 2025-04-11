import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserOutlined, 
  EditOutlined, 
  WalletOutlined, 
  DollarOutlined,
  SettingOutlined,
  BellOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { LoggedInNav } from '@/components/ui/logged-in-nav';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import { Select } from '@/components/ui/select';
import { OnboardingHeading } from '@/components/onboarding/OnboardingHeading';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    username: 'creator123',
    displayName: 'Creator Name',
    bio: 'This is my bio.',
    profileImage: '',
    tipAmounts: [1, 5, 10],
    allowCustomAmounts: true,
    receiveNotes: true,
    minimumTipAmount: 1,
    notificationsEnabled: false,
    notificationChannel: 'email',
    notificationEmail: '',
    notificationTelegram: '',
  });

  const handleChange = (field:string, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Simulate saving profile data
    console.log('Profile data saved:', profileData);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <OnboardingHeading
        title="Edit Your Profile" 
        subtitle="Update your profile and preferences." 
      />

      <div className="space-y-6">
        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Wallet Address</label>
          <Input
            value={profileData.walletAddress}
            disabled
            className="w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input
            value={profileData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <Input
            value={profileData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            value={profileData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="w-full"
          />
        </div>

        {/* Tip Preferences */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Tip Amounts</label>
          <div className="flex flex-wrap gap-2">
            {profileData.tipAmounts.map((amount) => (
              <div
                key={amount}
                className="px-4 py-2 rounded-lg border bg-brand-primary text-white"
              >
                ${amount}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.allowCustomAmounts}
            onChange={(e) => handleChange('allowCustomAmounts', e.target.checked)}
            className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <label className="text-sm font-medium">Allow Custom Tip Amounts</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.receiveNotes}
            onChange={(e) => handleChange('receiveNotes', e.target.checked)}
            className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <label className="text-sm font-medium">Allow Supporters to Leave Notes</label>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notifications</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={profileData.notificationsEnabled}
              onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
              className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
            />
            <label className="text-sm font-medium">Enable Notifications</label>
          </div>

          {profileData.notificationsEnabled && (
            <div className="space-y-4">
              <Select
                value={profileData.notificationChannel}
                onChange={(value) => handleChange('notificationChannel', value)}
                options={[
                  { label: 'Email', value: 'email' },
                  { label: 'Telegram', value: 'telegram' },
                ]}
              />

              {profileData.notificationChannel === 'email' && (
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={profileData.notificationEmail}
                  onChange={(e) => handleChange('notificationEmail', e.target.value)}
                  className="w-full"
                />
              )}

              {profileData.notificationChannel === 'telegram' && (
                <Input
                  type="text"
                  placeholder="@yourusername"
                  value={profileData.notificationTelegram}
                  onChange={(e) => handleChange('notificationTelegram', e.target.value)}
                  className="w-full"
                />
              )}
            </div>
          )}
        </div>

        <Button onClick={handleSave} className="w-full bg-brand-primary text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();

  const userProfile = {
    walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    username: 'creator123',
    displayName: 'Creator Name',
    bio: 'Web3 creator and developer building in the Solana ecosystem.',
    tipAmounts: [1, 5, 10, 25],
    allowCustomAmounts: true,
    receiveNotes: true,
    minimumTipAmount: 1,
    notificationsEnabled: true,
    notificationChannel: 'email',
    notificationEmail: 'creator@example.com',
  };

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Replace the existing header with our sidebar navigation */}
      <SidebarNav username={userProfile.username} />

      <motion.div
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Your Profile</h1>
          </div>
          <Button 
            onClick={() => navigate('/profile/edit')} 
            variant="default"
            className="flex items-center gap-2"
          >
            <EditOutlined /> Edit Profile
          </Button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <motion.div 
              variants={itemVariants} 
              className="bg-brand-surface rounded-xl border border-brand-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <UserOutlined className="text-brand-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-brand-muted-foreground">Display Name</span>
                  <span className="font-medium">{userProfile.displayName}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-brand-muted-foreground">Username</span>
                  <div className="flex items-center">
                    <span className="text-brand-primary mr-1">@</span>
                    <span className="font-medium">{userProfile.username}</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-brand-muted-foreground">Bio</span>
                  <p>{userProfile.bio}</p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-brand-muted-foreground">Wallet Address</span>
                  <span className="font-mono text-sm truncate">{userProfile.walletAddress}</span>
                </div>
              </div>
            </motion.div>

            {/* Tip Settings */}
            <motion.div 
              variants={itemVariants} 
              className="bg-brand-surface rounded-xl border border-brand-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tip Settings</h2>
                <DollarOutlined className="text-brand-muted-foreground" />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-brand-muted-foreground mb-2">Default Tip Amounts</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.tipAmounts.map((amount) => (
                      <div
                        key={amount}
                        className="px-4 py-2 rounded-lg border border-brand-border bg-brand-primary text-white"
                      >
                        ${amount}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-brand-muted-foreground mb-2">Additional Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-surface border border-brand-border">
                      <span>Minimum Tip Amount</span>
                      <span className="font-medium">${userProfile.minimumTipAmount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-surface border border-brand-border">
                      <span>Allow Custom Amounts</span>
                      <div className={`w-4 h-4 rounded-full ${userProfile.allowCustomAmounts ? 'bg-green-500' : 'bg-brand-muted-foreground'}`}></div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-surface border border-brand-border">
                      <span>Receive Notes with Tips</span>
                      <div className={`w-4 h-4 rounded-full ${userProfile.receiveNotes ? 'bg-green-500' : 'bg-brand-muted-foreground'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Notifications */}
            <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <BellOutlined className="text-brand-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Notifications Status</span>
                  <div className={`px-3 py-1 rounded-full text-xs ${userProfile.notificationsEnabled ? 'bg-green-500/10 text-green-500' : 'bg-brand-muted-foreground/10 text-brand-muted-foreground'}`}>
                    {userProfile.notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                {userProfile.notificationsEnabled && (
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-brand-muted-foreground">Channel</span>
                      <span className="font-medium capitalize">{userProfile.notificationChannel}</span>
                    </div>
                    
                    {userProfile.notificationEmail && (
                      <div className="flex flex-col">
                        <span className="text-sm text-brand-muted-foreground">Email Address</span>
                        <span>{userProfile.notificationEmail}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-xl border border-brand-border p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 rounded-full blur-3xl"></div>
              
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              
              <div className="space-y-3 relative z-10">
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <DollarOutlined className="mr-2" /> View Your Tips
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile/edit')}
                >
                  <EditOutlined className="mr-2" /> Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <SettingOutlined className="mr-2" /> Account Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
export { EditProfile };