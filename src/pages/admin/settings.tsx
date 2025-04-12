import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  SettingOutlined,
  SaveOutlined,
  LockOutlined,
  DollarOutlined,
  MobileOutlined,
  BellOutlined,
  GlobalOutlined,
  PercentageOutlined,
  UserOutlined,
  PictureOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  CodeOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { notification, Tabs, Switch, Tooltip, Collapse } from 'antd';
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalBody, 
  ModalFooter 
} from '@/components/ui/modal';

const { TabPane } = Tabs;
const { Panel } = Collapse;

// Mock settings data
const mockSettings = {
  general: {
    siteName: 'TippLink',
    siteDescription: 'Instant tips for creators, no login required',
    contactEmail: 'support@tipplink.io',
    supportUrl: 'https://support.tipplink.io',
    maintenanceMode: false,
    signupsEnabled: true,
    requireEmailVerification: true,
    defaultUserCurrency: 'USD',
    timeZone: 'UTC',
    termsUrl: 'https://tipplink.io/terms',
    privacyUrl: 'https://tipplink.io/privacy'
  },
  payment: {
    processingFee: 2.5,
    minimumTipAmount: 1.00,
    maximumTipAmount: 1000.00,
    solanaEndpoint: 'https://api.mainnet-beta.solana.com',
    acceptedTokens: ['USDC'],
    paymentTimeout: 120, // seconds
    enableMicroTips: true,
    requireWalletVerification: true,
    withdrawalMinimum: 5.00,
    withdrawalFee: 0.5
  },
  security: {
    mfaRequired: true,
    passwordStrengthScore: 3, // 1-4
    sessionTimeout: 3600, // seconds
    loginAttempts: 5,
    blockDuration: 30, // minutes
    adminIpWhitelist: ['192.168.1.1', '192.168.1.2'],
    fraudDetectionEnabled: true,
    rateLimit: {
      enabled: true,
      maxRequestsPerMinute: 100
    }
  },
  notifications: {
    email: {
      enabled: true,
      fromEmail: 'noreply@tipplink.io',
      tipReceived: true,
      tipFailed: true,
      newSignup: true,
      withdrawalComplete: true
    },
    push: {
      enabled: true,
      tipReceived: true,
      tipFailed: true,
      withdrawalComplete: true
    }
  },
  branding: {
    primaryColor: '#6C3BFC',
    secondaryColor: '#FFCD29',
    logoUrl: '/assets/images/tipp-link-logo.png',
    favicon: '/public/favicon.png',
    enableCustomBranding: true,
    creatorCustomBrandingEnabled: true
  }
};

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeAccordions, setActiveAccordions] = useState(['general-basic']);

  // Handle settings changes
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  // Handle nested settings changes
  const handleNestedSettingChange = (category, nested, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [nested]: {
          ...prev[category][nested],
          [key]: value
        }
      }
    }));
    setUnsavedChanges(true);
  };

  // Save settings
  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setUnsavedChanges(false);
      
      notification.success({
        message: 'Settings Saved',
        description: 'Your settings have been successfully updated.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    }, 1000);
  };

  // Reset to default settings
  const resetToDefault = () => {
    setIsResetModalOpen(false);
    
    // In a real app, you'd fetch default settings from the API
    // For now we'll just show a notification
    notification.info({
      message: 'Settings Reset',
      description: 'All settings have been reset to default values.',
      icon: <ReloadOutlined style={{ color: '#1677ff' }} />
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AdminLayout title="Platform Settings">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-brand-foreground">Platform Settings</h2>
            <p className="text-brand-muted-foreground mt-1">
              Configure global settings that affect the entire TippLink platform
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unsavedChanges && (
              <span className="text-yellow-500 text-sm flex items-center">
                <ExclamationCircleOutlined className="mr-1" />
                Unsaved changes
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center"
            >
              <ReloadOutlined className="mr-2" />
              Reset to Default
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={isSaving || !unsavedChanges}
              className="flex items-center"
            >
              {isSaving ? (
                <ReloadOutlined spin className="mr-2" />
              ) : (
                <SaveOutlined className="mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </motion.div>
        
        {/* Settings Content */}
        <motion.div variants={itemVariants} className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="px-6 pt-4"
            tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid var(--brand-border)' }}
          >
            <TabPane 
              tab={
                <span className="flex items-center">
                  <SettingOutlined className="mr-2" />
                  General
                </span>
              } 
              key="general"
            >
              <div className="p-6">
                <Collapse 
                  defaultActiveKey={['general-basic']}
                  onChange={(keys) => setActiveAccordions(keys)}
                  bordered={false}
                  className="bg-transparent"
                >
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <GlobalOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Basic Information</span>
                      </div>
                    } 
                    key="general-basic"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input
                            id="siteName"
                            value={settings.general.siteName}
                            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={settings.general.contactEmail}
                            onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Input
                          id="siteDescription"
                          value={settings.general.siteDescription}
                          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="supportUrl">Support URL</Label>
                          <Input
                            id="supportUrl"
                            value={settings.general.supportUrl}
                            onChange={(e) => handleSettingChange('general', 'supportUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="defaultUserCurrency">Default Currency</Label>
                          <select
                            id="defaultUserCurrency"
                            value={settings.general.defaultUserCurrency}
                            onChange={(e) => handleSettingChange('general', 'defaultUserCurrency', e.target.value)}
                            className="w-full mt-1 border border-brand-border rounded-md px-3 py-1.5 bg-brand-surface"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="termsUrl">Terms of Service URL</Label>
                          <Input
                            id="termsUrl"
                            value={settings.general.termsUrl}
                            onChange={(e) => handleSettingChange('general', 'termsUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                          <Input
                            id="privacyUrl"
                            value={settings.general.privacyUrl}
                            onChange={(e) => handleSettingChange('general', 'privacyUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Panel>
                  
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <DesktopOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Site Configuration</span>
                      </div>
                    } 
                    key="general-site"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Maintenance Mode</span>
                            <Switch 
                              size="small"
                              checked={settings.general.maintenanceMode} 
                              onChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            When enabled, the site will show a maintenance page to visitors
                          </p>
                        </div>
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Enable User Signups</span>
                            <Switch 
                              size="small"
                              checked={settings.general.signupsEnabled} 
                              onChange={(checked) => handleSettingChange('general', 'signupsEnabled', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Allow new users to register on the platform
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Require Email Verification</span>
                            <Switch 
                              size="small"
                              checked={settings.general.requireEmailVerification} 
                              onChange={(checked) => handleSettingChange('general', 'requireEmailVerification', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            New users must verify their email before accessing features
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="timeZone">Default Time Zone</Label>
                          <select
                            id="timeZone"
                            value={settings.general.timeZone}
                            onChange={(e) => handleSettingChange('general', 'timeZone', e.target.value)}
                            className="w-full mt-1 border border-brand-border rounded-md px-3 py-1.5 bg-brand-surface"
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="Asia/Tokyo">Asia/Tokyo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  <DollarOutlined className="mr-2" />
                  Payments
                </span>
              } 
              key="payment"
            >
              <div className="p-6">
                <Collapse 
                  defaultActiveKey={['payment-basics']}
                  bordered={false}
                  className="bg-transparent"
                >
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <PercentageOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Fee Structure</span>
                      </div>
                    } 
                    key="payment-fees"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="processingFee">Processing Fee (%)</Label>
                          <Input
                            id="processingFee"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={settings.payment.processingFee}
                            onChange={(e) => handleSettingChange('payment', 'processingFee', parseFloat(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-xs text-brand-muted-foreground mt-1">
                            Percentage fee charged on each transaction
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="withdrawalFee">Withdrawal Fee ($)</Label>
                          <Input
                            id="withdrawalFee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={settings.payment.withdrawalFee}
                            onChange={(e) => handleSettingChange('payment', 'withdrawalFee', parseFloat(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-xs text-brand-muted-foreground mt-1">
                            Fixed fee charged on withdrawals
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="withdrawalMinimum">Minimum Withdrawal ($)</Label>
                          <Input
                            id="withdrawalMinimum"
                            type="number"
                            step="0.01"
                            min="0"
                            value={settings.payment.withdrawalMinimum}
                            onChange={(e) => handleSettingChange('payment', 'withdrawalMinimum', parseFloat(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-xs text-brand-muted-foreground mt-1">
                            Minimum amount required to withdraw
                          </p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                  
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <DollarOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Transaction Limits</span>
                      </div>
                    } 
                    key="payment-limits"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="minimumTipAmount">Minimum Tip Amount ($)</Label>
                          <Input
                            id="minimumTipAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={settings.payment.minimumTipAmount}
                            onChange={(e) => handleSettingChange('payment', 'minimumTipAmount', parseFloat(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maximumTipAmount">Maximum Tip Amount ($)</Label>
                          <Input
                            id="maximumTipAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={settings.payment.maximumTipAmount}
                            onChange={(e) => handleSettingChange('payment', 'maximumTipAmount', parseFloat(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="paymentTimeout">Payment Timeout (seconds)</Label>
                          <Input
                            id="paymentTimeout"
                            type="number"
                            step="1"
                            min="30"
                            value={settings.payment.paymentTimeout}
                            onChange={(e) => handleSettingChange('payment', 'paymentTimeout', parseInt(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-xs text-brand-muted-foreground mt-1">
                            How long to wait for payment confirmation
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Enable Micro-Tips</span>
                            <Switch 
                              size="small"
                              checked={settings.payment.enableMicroTips} 
                              onChange={(checked) => handleSettingChange('payment', 'enableMicroTips', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Allow tip amounts smaller than $1 (may affect profitability)
                          </p>
                        </div>
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Require Wallet Verification</span>
                            <Switch 
                              size="small"
                              checked={settings.payment.requireWalletVerification} 
                              onChange={(checked) => handleSettingChange('payment', 'requireWalletVerification', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Users must verify their wallet before receiving funds
                          </p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                  
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <ApiOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Blockchain Configuration</span>
                      </div>
                    } 
                    key="payment-blockchain"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="solanaEndpoint">Solana RPC Endpoint</Label>
                        <Input
                          id="solanaEndpoint"
                          value={settings.payment.solanaEndpoint}
                          onChange={(e) => handleSettingChange('payment', 'solanaEndpoint', e.target.value)}
                          className="mt-1"
                          placeholder="https://api.mainnet-beta.solana.com"
                        />
                        <p className="text-xs text-brand-muted-foreground mt-1">
                          RPC endpoint for Solana blockchain interactions
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="acceptedTokens">Accepted Tokens</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Button 
                            variant={settings.payment.acceptedTokens.includes('USDC') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const updated = settings.payment.acceptedTokens.includes('USDC')
                                ? settings.payment.acceptedTokens.filter(t => t !== 'USDC')
                                : [...settings.payment.acceptedTokens, 'USDC'];
                              handleSettingChange('payment', 'acceptedTokens', updated);
                            }}
                          >
                            USDC
                          </Button>
                          <Button 
                            variant={settings.payment.acceptedTokens.includes('SOL') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const updated = settings.payment.acceptedTokens.includes('SOL')
                                ? settings.payment.acceptedTokens.filter(t => t !== 'SOL')
                                : [...settings.payment.acceptedTokens, 'SOL'];
                              handleSettingChange('payment', 'acceptedTokens', updated);
                            }}
                          >
                            SOL
                          </Button>
                          <Button 
                            variant={settings.payment.acceptedTokens.includes('BONK') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const updated = settings.payment.acceptedTokens.includes('BONK')
                                ? settings.payment.acceptedTokens.filter(t => t !== 'BONK')
                                : [...settings.payment.acceptedTokens, 'BONK'];
                              handleSettingChange('payment', 'acceptedTokens', updated);
                            }}
                          >
                            BONK
                          </Button>
                        </div>
                        <p className="text-xs text-brand-muted-foreground mt-2">
                          Select which tokens will be accepted for payments
                        </p>
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  <LockOutlined className="mr-2" />
                  Security
                </span>
              } 
              key="security"
            >
              <div className="p-6">
                <Collapse 
                  defaultActiveKey={['security-authentication']}
                  bordered={false}
                  className="bg-transparent"
                >
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <UserOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Authentication</span>
                      </div>
                    } 
                    key="security-authentication"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Require MFA for Admins</span>
                            <Switch 
                              size="small"
                              checked={settings.security.mfaRequired} 
                              onChange={(checked) => handleSettingChange('security', 'mfaRequired', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Force all admin users to set up multi-factor authentication
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            min="300"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            How long until user sessions expire
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="passwordStrength">Password Strength</Label>
                          <select
                            id="passwordStrength"
                            value={settings.security.passwordStrengthScore}
                            onChange={(e) => handleSettingChange('security', 'passwordStrengthScore', parseInt(e.target.value))}
                            className="w-full mt-1 border border-brand-border rounded-md px-3 py-1.5 bg-brand-surface"
                          >
                            <option value={1}>Basic - Letters and numbers</option>
                            <option value={2}>Medium - Letters, numbers, min length 8</option>
                            <option value={3}>Strong - Letters, numbers, special chars</option>
                            <option value={4}>Very Strong - All above + min length 12</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="loginAttempts">Failed Login Attempts</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="loginAttempts"
                              type="number"
                              min="1"
                              max="10"
                              value={settings.security.loginAttempts}
                              onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                            />
                            <span className="py-2">attempts</span>
                          </div>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Number of failed login attempts before blocking
                          </p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                  
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <CodeOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">API & Rate Limiting</span>
                      </div>
                    } 
                    key="security-api"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center justify-between">
                          <span>Enable Rate Limiting</span>
                          <Switch 
                            size="small"
                            checked={settings.security.rateLimit.enabled} 
                            onChange={(checked) => handleNestedSettingChange('security', 'rateLimit', 'enabled', checked)}
                          />
                        </Label>
                        <p className="text-sm text-brand-muted-foreground mt-1">
                          Protect against abuse by limiting API request rate
                        </p>
                      </div>
                      
                      {settings.security.rateLimit.enabled && (
                        <div>
                          <Label htmlFor="maxRequestsPerMinute">Max Requests Per Minute</Label>
                          <Input
                            id="maxRequestsPerMinute"
                            type="number"
                            min="10"
                            max="1000"
                            value={settings.security.rateLimit.maxRequestsPerMinute}
                            onChange={(e) => handleNestedSettingChange('security', 'rateLimit', 'maxRequestsPerMinute', parseInt(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Maximum number of API requests allowed per minute per IP
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="whitelistedIps">Admin IP Whitelist</Label>
                        <Input
                          id="whitelistedIps"
                          placeholder="192.168.1.1, 192.168.1.2"
                          value={settings.security.adminIpWhitelist.join(', ')}
                          onChange={(e) => handleSettingChange('security', 'adminIpWhitelist', e.target.value.split(',').map(ip => ip.trim()))}
                          className="mt-1"
                        />
                        <p className="text-sm text-brand-muted-foreground mt-1">
                          Only these IPs can access the admin panel (leave empty to allow all)
                        </p>
                      </div>
                      
                      <div>
                        <Label className="flex items-center justify-between">
                          <span>Fraud Detection</span>
                          <Switch 
                            size="small"
                            checked={settings.security.fraudDetectionEnabled} 
                            onChange={(checked) => handleSettingChange('security', 'fraudDetectionEnabled', checked)}
                          />
                        </Label>
                        <p className="text-sm text-brand-muted-foreground mt-1">
                          Automatically detect and prevent potentially fraudulent transactions
                        </p>
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  <BellOutlined className="mr-2" />
                  Notifications
                </span>
              } 
              key="notifications"
            >
              <div className="p-6">
                <Collapse 
                  defaultActiveKey={['notifications-email']}
                  bordered={false}
                  className="bg-transparent"
                >
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <MailOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Email Notifications</span>
                      </div>
                    } 
                    key="notifications-email"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center justify-between">
                          <span>Enable Email Notifications</span>
                          <Switch 
                            size="small"
                            checked={settings.notifications.email.enabled} 
                            onChange={(checked) => handleNestedSettingChange('notifications', 'email', 'enabled', checked)}
                          />
                        </Label>
                      </div>
                      
                      {settings.notifications.email.enabled && (
                        <>
                          <div>
                            <Label htmlFor="fromEmail">From Email Address</Label>
                            <Input
                              id="fromEmail"
                              type="email"
                              value={settings.notifications.email.fromEmail}
                              onChange={(e) => handleNestedSettingChange('notifications', 'email', 'fromEmail', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Email Notification Types</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">Tip Received</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.email.tipReceived} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'email', 'tipReceived', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">Tip Failed</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.email.tipFailed} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'email', 'tipFailed', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">New Signup</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.email.newSignup} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'email', 'newSignup', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">Withdrawal Complete</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.email.withdrawalComplete} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'email', 'withdrawalComplete', checked)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Button variant="outline" className="flex items-center">
                              <MailOutlined className="mr-2" />
                              Test Email Configuration
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Panel>
                  
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <MobileOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Push Notifications</span>
                      </div>
                    } 
                    key="notifications-push"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center justify-between">
                          <span>Enable Push Notifications</span>
                          <Switch 
                            size="small"
                            checked={settings.notifications.push.enabled} 
                            onChange={(checked) => handleNestedSettingChange('notifications', 'push', 'enabled', checked)}
                          />
                        </Label>
                      </div>
                      
                      {settings.notifications.push.enabled && (
                        <>
                          <div className="space-y-2">
                            <Label>Push Notification Types</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">Tip Received</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.push.tipReceived} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'push', 'tipReceived', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">Tip Failed</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.push.tipFailed} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'push', 'tipFailed', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 border border-brand-border rounded-md">
                                <span className="text-sm">Withdrawal Complete</span>
                                <Switch 
                                  size="small" 
                                  checked={settings.notifications.push.withdrawalComplete} 
                                  onChange={(checked) => handleNestedSettingChange('notifications', 'push', 'withdrawalComplete', checked)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Button variant="outline" className="flex items-center">
                              <MobileOutlined className="mr-2" />
                              Test Push Notification
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span className="flex items-center">
                  <PictureOutlined className="mr-2" />
                  Branding
                </span>
              } 
              key="branding"
            >
              <div className="p-6">
                <Collapse 
                  defaultActiveKey={['branding-visual']}
                  bordered={false}
                  className="bg-transparent"
                >
                  <Panel 
                    header={
                      <div className="flex items-center">
                        <PictureOutlined className="mr-2 text-brand-primary" />
                        <span className="font-medium">Visual Identity</span>
                      </div>
                    } 
                    key="branding-visual"
                    className="mb-2 border border-brand-border rounded-lg overflow-hidden"
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Primary Logo</Label>
                          <div className="mt-2 border border-dashed border-brand-border rounded-lg p-4 flex items-center justify-center">
                            <div className="text-center">
                              <img 
                                src={settings.branding.logoUrl} 
                                alt="Logo" 
                                className="max-h-16 mx-auto"
                              />
                              <Button variant="outline" size="sm" className="mt-4">
                                Upload Logo
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Favicon</Label>
                          <div className="mt-2 border border-dashed border-brand-border rounded-lg p-4 flex items-center justify-center">
                            <div className="text-center">
                              <img 
                                src={settings.branding.favicon} 
                                alt="Favicon" 
                                className="h-10 w-10 mx-auto"
                              />
                              <Button variant="outline" size="sm" className="mt-4">
                                Upload Favicon
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex items-center mt-1 gap-2">
                            <input
                              id="primaryColor"
                              type="color"
                              value={settings.branding.primaryColor}
                              onChange={(e) => handleSettingChange('branding', 'primaryColor', e.target.value)}
                              className="w-10 h-10 border-0 p-0 bg-transparent"
                            />
                            <Input
                              value={settings.branding.primaryColor}
                              onChange={(e) => handleSettingChange('branding', 'primaryColor', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <div className="flex items-center mt-1 gap-2">
                            <input
                              id="secondaryColor"
                              type="color"
                              value={settings.branding.secondaryColor}
                              onChange={(e) => handleSettingChange('branding', 'secondaryColor', e.target.value)}
                              className="w-10 h-10 border-0 p-0 bg-transparent"
                            />
                            <Input
                              value={settings.branding.secondaryColor}
                              onChange={(e) => handleSettingChange('branding', 'secondaryColor', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Enable Custom Branding</span>
                            <Switch 
                              size="small"
                              checked={settings.branding.enableCustomBranding} 
                              onChange={(checked) => handleSettingChange('branding', 'enableCustomBranding', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Apply custom branding across the platform
                          </p>
                        </div>
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Allow Creator Custom Branding</span>
                            <Switch 
                              size="small"
                              checked={settings.branding.creatorCustomBrandingEnabled} 
                              onChange={(checked) => handleSettingChange('branding', 'creatorCustomBrandingEnabled', checked)}
                            />
                          </Label>
                          <p className="text-sm text-brand-muted-foreground mt-1">
                            Let creators customize their tip pages
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Preview</Label>
                        <div className="mt-2 border border-brand-border rounded-lg p-4 h-32 relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 w-full h-1"
                            style={{ backgroundColor: settings.branding.primaryColor }}
                          ></div>
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: settings.branding.primaryColor }}
                            >
                              <UserOutlined />
                            </div>
                            <div className="ml-3">
                              <div className="font-semibold">Creator Name</div>
                              <div className="text-sm text-brand-muted-foreground">@username</div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button
                              style={{ 
                                backgroundColor: settings.branding.primaryColor,
                                borderColor: settings.branding.primaryColor,
                                color: '#fff'
                              }}
                            >
                              Send Tip
                            </Button>
                            <Button 
                              variant="outline" 
                              className="ml-2"
                              style={{ 
                                borderColor: settings.branding.secondaryColor,
                                color: settings.branding.secondaryColor
                              }}
                            >
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
          </Tabs>
        </motion.div>
      </motion.div>
      
      {/* Reset Confirmation Modal */}
      <Modal
        open={isResetModalOpen}
        onCancel={() => setIsResetModalOpen(false)}
      >
        <ModalHeader>
          <ModalTitle>Reset to Default Settings</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center text-center mb-4">
            <ExclamationCircleOutlined className="text-yellow-500 text-4xl mb-4" />
            <p>Are you sure you want to reset all settings to their default values?</p>
            <p className="mt-2 text-brand-muted-foreground">This action cannot be undone. All custom configurations will be lost.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsResetModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={resetToDefault}
            className="bg-red-500 hover:bg-red-600 border-none text-white hover:text-white"
          >
            Reset All Settings
          </Button>
        </ModalFooter>
      </Modal>
    </AdminLayout>
  );
};

export default AdminSettingsPage;