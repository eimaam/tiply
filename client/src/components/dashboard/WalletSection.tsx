import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Alert, Tooltip, Spin, Typography } from 'antd';
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

const { Paragraph } = Typography;
const AntInput = Input;

interface WalletSectionProps {
  className?: string;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ className }) => {
  const [form] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const { user, updateUser } = useUser();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch wallet balance when component mounts
  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const response = await userService.getWalletBalance();
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

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

  // Handle withdrawal form submission
  const handleWithdraw = async (values: { amount: string }) => {
    setIsWithdrawing(true);
    setError('');
    
    try {
      const amount = parseFloat(values.amount);
      await userService.requestWithdrawal(amount);
      
      // Refresh balance after withdrawal
      const response = await userService.getWalletBalance();
      setBalance(response.data.balance);
      
      // Reset form and hide withdrawal form
      withdrawForm.resetFields();
      setShowWithdrawForm(false);
      setSuccessMessage('Withdrawal request submitted successfully! 💸');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Failed to withdraw funds:', error);
      setError(error?.response?.data?.message || 'Failed to withdraw funds. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
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
              <span>Your Tiply Balance</span>
              <Tooltip title="This is the balance of your Tiply account">
                <QuestionCircleOutlined className="ml-1 text-xs text-brand-muted-foreground" />
              </Tooltip>
            </h3>
            {isLoadingBalance ? (
              <Spin size="small" />
            ) : (
              <button 
                onClick={() => {
                  setIsLoadingBalance(true);
                  userService.getWalletBalance()
                    .then(response => {
                      setBalance(response.data.balance);
                    })
                    .catch(error => {
                      console.error('Error refreshing balance:', error);
                    })
                    .finally(() => {
                      setIsLoadingBalance(false);
                    });
                }}
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
                <>${balance?.toFixed(2) ?? '0.00'} USDC</>
              )}
            </h4>
            <Button 
              size="sm" 
              variant="outline"
              disabled={!balance || balance <= 0}
              onClick={() => {
                setShowWithdrawForm(prev => !prev);
              }}
              className="text-sm"
            >
              Withdraw Funds
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Your Tip Address</h3>
          <p className="text-sm text-brand-muted-foreground mb-4">
            This is your unique Tiply address where you receive tips. Share this with your supporters!
          </p>
          
          <div className="flex items-center">
            <Paragraph
              className="text-sm bg-brand-accent/10 p-2 rounded border border-brand-border flex-1 mb-0 overflow-hidden text-ellipsis"
              copyable={false}
            >
              {user?.depositWalletAddress || 'Wallet address not yet generated'}
            </Paragraph>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddressToClipboard}
              disabled={!user?.depositWalletAddress}
              className="ml-2"
            >
              {copied ? <CheckOutlined /> : <CopyOutlined />}
              <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
          
          {user?.depositWalletAddress && (
            <div className="mt-2 text-xs text-brand-muted-foreground">
              <ExclamationCircleOutlined className="mr-1" />
              This address accepts USDC (SPL) on Solana network only
            </div>
          )}
          
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              icon={<LinkOutlined />}
              onClick={() => {
                // Copy tip URL logic
                const tipUrl = `${window.location.origin}/tip/${user?.username || ''}`;
                navigator.clipboard.writeText(tipUrl);
                alert('Tip link copied to clipboard!');
              }}
            >
              Copy Tip Link
            </Button>
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
              type="submit"
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
        
        {user?.withdrawalWalletAddress && balance > 0 && (
          <div className="mt-4">
            <div className="p-4 rounded-md border border-brand-border bg-brand-accent/5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Available Balance</p>
                  <p className="text-lg font-bold">${balance} USDC</p>
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setShowWithdrawForm(prev => !prev)}
                    className="bg-brand-primary hover:bg-brand-primary/90"
                  >
                    {showWithdrawForm ? 'Cancel' : 'Withdraw Funds'}
                  </Button>
                </motion.div>
              </div>
              
              {showWithdrawForm && (
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <Form
                    form={withdrawForm}
                    layout="vertical"
                    onFinish={handleWithdraw}
                  >
                    <Form.Item
                      name="amount"
                      label="Amount to withdraw (USDC)"
                      rules={[
                        { required: true, message: 'Please enter an amount' },
                        {
                          validator: (_, value) => {
                            const amount = parseFloat(value);
                            if (isNaN(amount) || amount <= 0) {
                              return Promise.reject('Please enter a valid amount');
                            }
                            if (amount > balance) {
                              return Promise.reject('Amount exceeds your available balance');
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <AntInput
                        type="number"
                        min={0.01}
                        max={balance ?? 0}
                        step={0.01}
                        placeholder="0.00"
                        prefix="$"
                        suffix="USDC"
                        className="rounded-md border-brand-border bg-transparent"
                      />
                    </Form.Item>
                    
                    <div className="text-xs text-brand-muted-foreground mb-4">
                      Funds will be sent to: <span className="font-mono">{user.withdrawalWalletAddress}</span>
                    </div>
                    
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full bg-brand-primary hover:bg-brand-primary/90"
                        disabled={isWithdrawing}
                        htmlType="submit"
                      >
                        {isWithdrawing ? (
                          <><Spin size="small" /> Processing Withdrawal...</>
                        ) : (
                          <>
                            <WalletOutlined className="mr-2" /> Withdraw Funds
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </Form>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};