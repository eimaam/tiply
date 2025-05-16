import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Alert, Tooltip, Spin, Typography, message } from 'antd';
import { 
  WalletOutlined,
  CopyOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { userService } from '@/services/user.service';
import { isValidSolanaAddress } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { Withdrawal } from '@/components/wallet/Withdrawal';

const { Paragraph } = Typography;
const AntInput = Input;

interface WalletSectionProps {
  className?: string;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ className }) => {
  const [form] = Form.useForm();
  const { user, updateUser } = useUser();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [balance, setBalance] = useState<number | null>(user?.balance || null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch wallet balance when component mounts
  useEffect(() => {
    fetchBalance();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        withdrawalWalletAddress: user.withdrawalWalletAddress || '',
      });
    }
  }, [user, form]);

  // Fetch wallet balance
  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await userService.getWalletBalance();
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // message.error('Failed to fetch balance. Please try again.');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Handle wallet address update
  const handleSubmit = async (values: { withdrawalWalletAddress: string }) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const { withdrawalWalletAddress } = values;
      
      // Validate Solana address format
      if (!isValidSolanaAddress(withdrawalWalletAddress)) {
        setError('Please enter a valid Solana wallet address.');
        setIsSubmitting(false);
        return;
      }
      
      const response = await userService.updateWalletAddress(withdrawalWalletAddress);
      
      // Update user context with new wallet address
      if (updateUser) {
        updateUser(response.data);
      }
      
      setSuccessMessage('Withdrawal wallet address updated successfully! 💰');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Failed to update wallet address:', error);
      setError(error?.response?.data?.message || 'Failed to update wallet address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful withdrawal
  const handleWithdrawalSuccess = () => {
    // Refresh the balance after successful withdrawal
    fetchBalance();
    message.success('Withdrawal completed successfully! 💸');
  };

  // Copy wallet address to clipboard
  const copyAddressToClipboard = () => {
    if (!user?.depositWalletAddress) return;
    
    navigator.clipboard.writeText(user.depositWalletAddress);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className={className}>
      <DashboardCard
        title="Wallet Settings"
        icon={<WalletOutlined />}
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setError('')}
          />
        )}

        {successMessage && (
          <Alert
            message="Success"
            description={successMessage}
            type="success"
            showIcon
            className="mb-6"
            closable
            onClose={() => setSuccessMessage('')}
          />
        )}

        <div className="mb-8 p-4 bg-brand-accent/10 rounded-lg border border-brand-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium flex items-center">
              <span>Your <code>tiply</code> Balance</span>
              <Tooltip title="This is the balance of your tiply account">
                <QuestionCircleOutlined className="ml-1 text-xs text-brand-muted-foreground" />
              </Tooltip>
            </h3>
            {isLoadingBalance ? (
              <Spin size="small" />
            ) : (
              <button 
                onClick={fetchBalance}
                className="text-xs text-brand-primary hover:text-brand-primary/90 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-bold">
              {isLoadingBalance ? (
                <Spin size="small" />
              ) : (
                <>${user?.balance?.toFixed(2) || balance?.toFixed(2) || '0.00'} USDC</>
              )}
            </h4>
            {(balance && balance > 0) && (
              <Withdrawal 
                balance={balance || 0} 
                onSuccess={handleWithdrawalSuccess} 
              />
            )}
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="withdrawalWalletAddress"
            label={
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {user?.withdrawalWalletAddress ? 'Update withdrawal address' : 'Set withdrawal address'}
                </span>
                <Tooltip title="This should be a valid Solana wallet address that you control">
                  <QuestionCircleOutlined className="text-brand-muted-foreground text-xs cursor-help" />
                </Tooltip>
              </div>
            }
            rules={[
              { required: true, message: 'Please enter a wallet address' },
              {
                pattern: /^[a-zA-Z0-9]{32,44}$/,
                message: 'Please enter a valid Solana wallet address'
              }
            ]}
          >
            <AntInput
              placeholder="Enter Solana wallet address" 
              className="rounded-md border-brand-border bg-transparent"
            />
          </Form.Item>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full bg-brand-primary hover:bg-brand-primary/90"
              disabled={isSubmitting}
              htmlType="submit"
            >
              {isSubmitting ? (
                <><Spin size="small" /> Setting Up Wallet...</>
              ) : (
                <>
                  <SaveOutlined className="mr-2" /> 
                  Save Wallet Address
                </>
              )}
            </Button>
          </motion.div>
        </Form>
        
        {user?.withdrawalWalletAddress && (
          <div className="mt-4 p-4 rounded-md border border-brand-border bg-brand-accent/5">
            <p className="text-sm mb-2">Your current withdrawal address:</p>
            <div className="flex items-center justify-between bg-brand-surface/80 p-2 rounded border border-brand-border/50">
              <code className="text-xs font-mono truncate">{user.withdrawalWalletAddress}</code>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(user.withdrawalWalletAddress || '');
                  message.success('Address copied to clipboard!');
                }}
                className="ml-2 px-2 py-0 h-6"
              >
                <CopyOutlined className="text-xs" />
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};