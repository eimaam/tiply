import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined, 
  CloseOutlined,
  DollarOutlined,
  BellOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { SidebarNav } from '@/components/ui/sidebar-nav';

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
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    walletAddress: 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2',
    username: 'creator123',
    displayName: 'Creator Name',
    bio: 'Web3 creator and developer building in the Solana ecosystem.',
    profileImage: '',
    tipAmounts: [1, 5, 10, 25],
    allowCustomAmounts: true,
    receiveNotes: true,
    minimumTipAmount: 1,
    notificationsEnabled: true,
    notificationChannel: 'email',
    notificationEmail: 'creator@example.com',
    notificationTelegram: '',
  });

  const handleChange = (field:string, value:any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    setSaved(true);
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTipAmountChange = (amount:number) => {
    // Add or remove amount from tipAmounts
    const updatedAmounts = [...profileData.tipAmounts];
    const index = updatedAmounts.indexOf(amount);
    
    if (index === -1 && updatedAmounts.length < 5) {
      updatedAmounts.push(amount);
    } else if (index !== -1) {
      updatedAmounts.splice(index, 1);
    }
    
    handleChange('tipAmounts', updatedAmounts);
  };

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Replace the existing header with our sidebar navigation */}
      <SidebarNav username={profileData.username} />

      <motion.div
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')}
              className="rounded-full"
            >
              <ArrowLeftOutlined />
            </Button>
            <h1 className="text-2xl font-semibold">Edit Profile</h1>
          </div>
          <Button 
            onClick={handleSave} 
            variant={saved ? "ghost" : "default"}
            className="flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : saved ? (
              <CheckCircleOutlined className="text-green-500" />
            ) : (
              <SaveOutlined />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
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
                <div>
                  <label className="block text-sm text-brand-muted-foreground mb-1">Display Name</label>
                  <Input
                    value={profileData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-brand-muted-foreground mb-1">Username</label>
                  <div className="relative">
                    <Input
                      value={profileData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className="w-full pl-8"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted-foreground">@</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-brand-muted-foreground mb-1">Bio</label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows={4}
                    className="w-full"
                    placeholder="Tell others about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-brand-muted-foreground mb-1">Wallet Address</label>
                  <Input
                    value={profileData.walletAddress}
                    readOnly
                    className="w-full font-mono text-sm bg-brand-surface/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-brand-muted-foreground mt-1">Connected wallet address cannot be changed</p>
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
                  <label className="block text-sm text-brand-muted-foreground mb-2">Minimum Tip Amount</label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={profileData.minimumTipAmount}
                    onChange={(e) => handleChange('minimumTipAmount', parseFloat(e.target.value) || 1)}
                    className="w-full max-w-xs"
                  />
                </div>
              
                <div>
                  <label className="block text-sm text-brand-muted-foreground mb-2">Default Tip Amounts</label>
                  <p className="text-xs text-brand-muted-foreground mb-2">Select up to 5 default tip amounts</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 5, 10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleTipAmountChange(amount)}
                        className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                          profileData.tipAmounts.includes(amount)
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-brand-surface text-brand-foreground border-brand-border hover:border-brand-primary/50'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-brand-border">
                  <input
                    id="allowCustomAmounts"
                    type="checkbox"
                    checked={profileData.allowCustomAmounts}
                    onChange={(e) => handleChange('allowCustomAmounts', e.target.checked)}
                    className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="allowCustomAmounts">Allow Custom Tip Amounts</label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-brand-border">
                  <input
                    id="receiveNotes"
                    type="checkbox"
                    checked={profileData.receiveNotes}
                    onChange={(e) => handleChange('receiveNotes', e.target.checked)}
                    className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="receiveNotes">Allow Supporters to Leave Notes</label>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Notification Settings */}
            <div className="bg-brand-surface rounded-xl border border-brand-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <BellOutlined className="text-brand-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-brand-border">
                  <input
                    id="enableNotifications"
                    type="checkbox"
                    checked={profileData.notificationsEnabled}
                    onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                    className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="enableNotifications">Enable Tip Notifications</label>
                </div>
                
                {profileData.notificationsEnabled && (
                  <div className="p-4 border border-brand-border rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm text-brand-muted-foreground mb-1">
                        Notification Channel
                      </label>
                      <select
                        value={profileData.notificationChannel}
                        onChange={(e) => handleChange('notificationChannel', e.target.value)}
                        className="w-full p-2 rounded-lg border border-brand-border bg-brand-surface"
                      >
                        <option value="email">Email</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </div>
                    
                    {profileData.notificationChannel === 'email' && (
                      <div>
                        <label className="block text-sm text-brand-muted-foreground mb-1">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={profileData.notificationEmail}
                          onChange={(e) => handleChange('notificationEmail', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    {profileData.notificationChannel === 'telegram' && (
                      <div>
                        <label className="block text-sm text-brand-muted-foreground mb-1">
                          Telegram Username
                        </label>
                        <Input
                          placeholder="@yourusername"
                          value={profileData.notificationTelegram}
                          onChange={(e) => handleChange('notificationTelegram', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Save Card */}
            <div className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-xl border border-brand-border p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 rounded-full blur-3xl"></div>
              
              <h2 className="text-xl font-semibold mb-4">Save Changes</h2>
              
              <div className="space-y-3 relative z-10">
                <p className="text-sm text-brand-muted-foreground">
                  Don't forget to save your changes before leaving this page.
                </p>
                
                <Button 
                  onClick={handleSave} 
                  variant="default"
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfile;