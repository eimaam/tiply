import React, { useState, useEffect } from 'react';
import { Form, Input, Alert, Select, Tooltip, Switch, InputNumber } from 'antd';
import { 
  DollarOutlined, 
  MessageOutlined, 
  CheckCircleOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  EditOutlined // Changed from PaletteOutlined to EditOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { userService } from '@/services/user.service';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

interface TipSettingsProps {
  className?: string;
}

interface TipAmountOption {
  id: string;
  amount: number;
}

interface TipSettings {
  defaultMessage: string;
  suggestedAmounts: TipAmountOption[];
  allowCustomAmount: boolean;
  minimumAmount: number;
  accentColor: string;
  showSocialOnTipPage: boolean;
}

export const TipSettings: React.FC<TipSettingsProps> = ({ className }) => {
  const { user, refreshUser } = useUser();
  const [form] = Form.useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [tipSettings, setTipSettings] = useState<TipSettings>({
    defaultMessage: 'Thanks for supporting my work! 💖',
    suggestedAmounts: [
      { id: '1', amount: 5 },
      { id: '2', amount: 10 },
      { id: '3', amount: 20 }
    ],
    allowCustomAmount: true,
    minimumAmount: 1,
    accentColor: '#8B5CF6', // Default violet color
    showSocialOnTipPage: true
  });

  // Fetch user's tip settings when component mounts
  useEffect(() => {
    const fetchTipSettings = async () => {
      try {
        // Simulating fetch - would be replaced with actual API call
        const response = await userService.getTipSettings();
        if (response?.data) {
          setTipSettings(response.data);
          form.setFieldsValue({
            defaultMessage: response.data.defaultMessage,
            minimumAmount: response.data.minimumAmount,
            allowCustomAmount: response.data.allowCustomAmount,
            accentColor: response.data.accentColor,
            showSocialOnTipPage: response.data.showSocialOnTipPage,
          });
          
          // Set suggested amounts
          response.data.suggestedAmounts.forEach((option: TipAmountOption, index: number) => {
            form.setFieldsValue({
              [`suggestedAmount${index + 1}`]: option.amount
            });
          });
        }
      } catch (error) {
        console.error('Failed to fetch tip settings', error);
      }
    };

    if (user?.id) {
      fetchTipSettings();
    }
  }, [user, form]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Transform form values into the required format
      const suggestedAmounts = [
        { id: '1', amount: Number(values.suggestedAmount1) },
        { id: '2', amount: Number(values.suggestedAmount2) },
        { id: '3', amount: Number(values.suggestedAmount3) }
      ];
      
      const updatedSettings = {
        defaultMessage: values.defaultMessage,
        suggestedAmounts: suggestedAmounts,
        allowCustomAmount: values.allowCustomAmount,
        minimumAmount: Number(values.minimumAmount),
        accentColor: values.accentColor,
        showSocialOnTipPage: values.showSocialOnTipPage
      };

      // Submit to the server
      await userService.updateTipSettings(updatedSettings);
      
      // Update local state
      setTipSettings(updatedSettings);
      
      // Show success message
      setSuccessMessage('Tip settings updated successfully! ✨');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Failed to update tip settings:', error);
      setError(error?.response?.data?.message || 'Failed to update tip settings. Please try again later. 😔');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color presets for the accent color picker
  const colorPresets = [
    '#a78bfa', // Primary violet
    '#38bdf8', // Sky blue
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Red
    '#6b7280', // Gray
    '#000000', // Black
    '#ffffff'  // White
  ];

  return (
    <DashboardCard 
      title="Tip Settings"
      description="Customize how supporters can tip you"
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
          defaultMessage: tipSettings.defaultMessage,
          suggestedAmount1: tipSettings.suggestedAmounts[0]?.amount || 5,
          suggestedAmount2: tipSettings.suggestedAmounts[1]?.amount || 10, 
          suggestedAmount3: tipSettings.suggestedAmounts[2]?.amount || 20,
          allowCustomAmount: tipSettings.allowCustomAmount,
          minimumAmount: tipSettings.minimumAmount,
          accentColor: tipSettings.accentColor,
          showSocialOnTipPage: tipSettings.showSocialOnTipPage
        }}
        onFinish={handleSubmit}
        className="space-y-6"
      >
        {/* Default Thank You Message */}
        <Form.Item
          label={
            <div className="flex items-center">
              <span>Default Thank You Message</span>
              <Tooltip title="This message will be shown to users by default when they visit your tip page">
                <QuestionCircleOutlined className="ml-2 text-brand-muted-foreground" />
              </Tooltip>
            </div>
          }
          name="defaultMessage"
          rules={[
            { max: 100, message: 'Message cannot exceed 100 characters' }
          ]}
        >
          <Textarea
            placeholder="Thanks for supporting my work! 💖"
            className="resize-y min-h-[80px]"
          />
        </Form.Item>
        
        <div className="border-t border-brand-border pt-6">
          <h3 className="text-lg font-medium mb-4">Suggested Amounts</h3>
          <p className="text-sm text-brand-muted-foreground mb-4">
            Set up to three suggested tip amounts in USDC for your supporters (minimum 1 USDC)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Suggested Amount 1 */}
            <Form.Item
              label="Amount 1"
              name="suggestedAmount1"
              rules={[
                { required: true, message: 'Please set at least one amount' },
                { type: 'number', min: 1, message: 'Minimum amount is 1 USDC' }
              ]}
            >
              <InputNumber
                prefix={<DollarOutlined />}
                min={1}
                className="w-full"
                addonAfter="USDC"
              />
            </Form.Item>
            
            {/* Suggested Amount 2 */}
            <Form.Item
              label="Amount 2"
              name="suggestedAmount2"
              rules={[
                { type: 'number', min: 1, message: 'Minimum amount is 1 USDC' }
              ]}
            >
              <InputNumber
                prefix={<DollarOutlined />}
                min={1}
                className="w-full"
                addonAfter="USDC"
              />
            </Form.Item>
            
            {/* Suggested Amount 3 */}
            <Form.Item
              label="Amount 3"
              name="suggestedAmount3"
              rules={[
                { type: 'number', min: 1, message: 'Minimum amount is 1 USDC' }
              ]}
            >
              <InputNumber
                prefix={<DollarOutlined />}
                min={1}
                className="w-full"
                addonAfter="USDC"
              />
            </Form.Item>
          </div>
        </div>
        
        <div className="border-t border-brand-border pt-6">
          <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
          
          {/* Allow Custom Amount Toggle */}
          <Form.Item
            label={
              <div className="flex items-center">
                <span>Allow Custom Amounts</span>
                <Tooltip title="When enabled, supporters can enter their own tip amount">
                  <QuestionCircleOutlined className="ml-2 text-brand-muted-foreground" />
                </Tooltip>
              </div>
            }
            name="allowCustomAmount"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          {/* Minimum Amount (only visible if allowCustomAmount is true) */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.allowCustomAmount !== currentValues.allowCustomAmount
            }
          >
            {({ getFieldValue }) => 
              getFieldValue('allowCustomAmount') ? (
                <Form.Item
                  label={
                    <div className="flex items-center">
                      <span>Minimum Custom Amount</span>
                      <Tooltip title="The minimum amount supporters can tip you">
                        <QuestionCircleOutlined className="ml-2 text-brand-muted-foreground" />
                      </Tooltip>
                    </div>
                  }
                  name="minimumAmount"
                  rules={[
                    { required: true, message: 'Please set a minimum amount' },
                    { type: 'number', min: 1, message: 'Minimum amount is 1 USDC' }
                  ]}
                >
                  <InputNumber
                    prefix={<DollarOutlined />}
                    min={1}
                    className="w-full md:w-1/3"
                    addonAfter="USDC"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          
          {/* Accent Color */}
          <Form.Item
            label={
              <div className="flex items-center">
                <span>Accent Color</span>
                <Tooltip title="This color will be used for buttons and highlights on your tip page">
                  <QuestionCircleOutlined className="ml-2 text-brand-muted-foreground" />
                </Tooltip>
              </div>
            }
            name="accentColor"
          >
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(color => (
                <div 
                  key={color}
                  onClick={() => form.setFieldsValue({ accentColor: color })}
                  className={cn(
                    "w-8 h-8 rounded-full cursor-pointer transition-all border-2",
                    form.getFieldValue('accentColor') === color 
                      ? "border-brand-foreground scale-110" 
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <Input 
                type="color" 
                className="w-8 h-8 p-0 border-2 rounded-full overflow-hidden cursor-pointer"
                onChange={(e) => form.setFieldsValue({ accentColor: e.target.value })}
                value={form.getFieldValue('accentColor')}
              />
            </div>
          </Form.Item>
          
          {/* Show Social Links Toggle */}
          <Form.Item
            label={
              <div className="flex items-center">
                <span>Show Social Links</span>
                <Tooltip title="Display your social media links on your tip page">
                  <QuestionCircleOutlined className="ml-2 text-brand-muted-foreground" />
                </Tooltip>
              </div>
            }
            name="showSocialOnTipPage"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
        
        <Form.Item className="mt-8">
          <Button
            variant="default"
            size="lg"
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </Form.Item>
      </Form>
      
      {/* Preview Section - could be implemented in a future iteration */}
      <div className="border-t border-brand-border mt-8 pt-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <EditOutlined className="mr-2" />
          Preview
        </h3>
        <p className="text-sm text-brand-muted-foreground mb-4">
          Coming soon: Live preview of how your tip page will look to supporters ✨
        </p>
      </div>
    </DashboardCard>
  );
};