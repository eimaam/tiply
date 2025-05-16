import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, Form, InputNumber, Spin, Alert, Steps, Typography } from 'antd';
import { WalletOutlined, LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { transactionService, WithdrawalRequest, WithdrawalStatus } from '@/services/transaction.service';

const { Text } = Typography;
const { Step } = Steps;

interface WithdrawalProps {
  balance: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const Withdrawal: React.FC<WithdrawalProps> = ({ balance, onSuccess, onError }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { user, refreshUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus | null>(null);
  const [statusPollingInterval, setStatusPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // When user data changes, set the default withdrawal address if available
  useEffect(() => {
    if (user?.withdrawalWalletAddress && form) {
      form.setFieldsValue({
        withdrawalAddress: user.withdrawalWalletAddress
      });
    }
  }, [user, form]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
      }
    };
  }, [statusPollingInterval]);

  const showWithdrawalModal = () => {
    setIsModalOpen(true);
    setCurrentStep(0);
    setError(null);
    setWithdrawalId(null);
    setWithdrawalStatus(null);
    
    // Reset form with withdrawalWalletAddress if available
    form.setFieldsValue({
      withdrawalAddress: user?.withdrawalWalletAddress || '',
      amount: balance > 0 ? Math.min(balance, 5) : 0
    });
  };

  const handleCancel = () => {
    // Only allow canceling if not in the middle of a withdrawal
    if (!isLoading && currentStep !== 1) {
      // Stop any ongoing polling
      if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        setStatusPollingInterval(null);
      }

      form.resetFields();
      setIsModalOpen(false);
      setCurrentStep(0);
      setError(null);
      setWithdrawalId(null);
      setWithdrawalStatus(null);
    }
  };

  const pollWithdrawalStatus = (transactionId: string) => {
    // Clear any existing interval
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval);
    }

    // Poll for updates every 3 seconds
    const interval = setInterval(async () => {
      try {
        const status = await transactionService.getWithdrawalStatus(transactionId);
        setWithdrawalStatus(status);

        // If status is completed or failed, stop polling
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          clearInterval(interval);
          setStatusPollingInterval(null);
          
          // Move to completion step if successful
          if (status.status === 'COMPLETED') {
            setCurrentStep(2);
            if (onSuccess) onSuccess();
          } else {
            setError(`Withdrawal failed: ${status.circleDetails?.errorReason || 'Unknown error'}`);
          }
          
          // Refresh user data to get updated balance
          refreshUser();
        }
      } catch (error) {
        console.error('Error polling withdrawal status:', error);
      }
    }, 3000);

    setStatusPollingInterval(interval);
  };

  const handleSubmit = async (values: { withdrawalAddress: string; amount: number }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare withdrawal request
      const withdrawalData: WithdrawalRequest = {
        withdrawalAddress: values.withdrawalAddress,
        amount: values.amount
      };

      // Initiate withdrawal
      const response = await transactionService.createWithdrawal(withdrawalData);
      
      // Store the withdrawal ID
      setWithdrawalId(response.transactionId);
      
      // Move to the processing step
      setCurrentStep(1);
      
      // Start polling for status updates
      pollWithdrawalStatus(response.transactionId);
      
      // Refresh user data to save withdrawal address
      refreshUser();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      setError(error?.response?.data?.message || 'Failed to process withdrawal. Please try again.');
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateAmount = (_: any, value: number) => {
    if (!value || value <= 0) {
      return Promise.reject('Amount must be greater than 0');
    }
    if (value > balance) {
      return Promise.reject(`Amount cannot exceed your balance of ${balance} USDC`);
    }
    // Require at least 1 USDC for withdrawal to cover fees
    if (value < 1) {
      return Promise.reject('Minimum withdrawal amount is 1 USDC');
    }
    return Promise.resolve();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Initial form
        return (
          <>
            <div className="mb-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
              <p className="text-brand-muted-foreground text-sm">
                Available balance: <span className="font-semibold">${balance.toFixed(2)} USDC</span>
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ 
                withdrawalAddress: user?.withdrawalWalletAddress || '',
                amount: balance > 0 ? Math.min(balance, 5) : 0 
              }}
            >
              <Form.Item
                label="Wallet Address"
                name="withdrawalAddress"
                rules={[
                  { required: true, message: 'Please enter your wallet address' },
                  { 
                    pattern: /^[a-zA-Z0-9]{32,44}$/, 
                    message: 'Please enter a valid Solana wallet address'
                  }
                ]}
                help="This address will be saved for future withdrawals"
              >
                <Input placeholder="Your Solana wallet address" />
              </Form.Item>

              <Form.Item
                label="Amount (USDC)"
                name="amount"
                rules={[
                  { required: true, message: 'Please enter an amount' },
                  { validator: validateAmount }
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  max={balance}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                  disabled={balance <= 0}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              {error && (
                <Alert
                  message="Error"
                  description={error}
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              <Form.Item>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    htmlType="submit"
                    className="flex-1 bg-brand-primary"
                    disabled={isLoading || balance <= 0}
                  >
                    {isLoading ? <Spin indicator={<LoadingOutlined style={{ color: 'white' }} />} /> : 'Withdraw'}
                  </Button>
                </div>
              </Form.Item>

              {balance <= 0 && (
                <div className="mt-2 text-center text-brand-muted-foreground text-sm">
                  You don't have any USDC available to withdraw.
                </div>
              )}
              
              <div className="mt-4 text-xs text-brand-muted-foreground">
                Note: Withdrawals may take a few moments to process. The USDC will be sent directly to your specified Solana wallet address.
              </div>
            </Form>
          </>
        );
      
      case 1: // Processing
        return (
          <div className="text-center py-4">
            <Spin spinning size="large" />
            <h3 className="mt-4 text-lg font-medium">Processing Your Withdrawal</h3>
            <p className="text-brand-muted-foreground">
              We're processing your withdrawal request. This may take a few moments.
            </p>
            
            {withdrawalStatus && (
              <div className="mt-4 text-left p-3 border rounded bg-gray-50 dark:bg-gray-800">
                <p><Text strong>Status:</Text> {withdrawalStatus.status}</p>
                <p><Text strong>Amount:</Text> {withdrawalStatus.amount} USDC</p>
                <p><Text strong>Transaction ID:</Text> {withdrawalStatus.transactionId}</p>
                
                {error && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    className="mt-4"
                  />
                )}
              </div>
            )}
          </div>
        );
      
      case 2: // Completed
        return (
          <div className="text-center py-4">
            <div className="text-green-500 text-5xl mb-4">
              <CheckCircleOutlined />
            </div>
            <h3 className="text-lg font-medium">Withdrawal Complete!</h3>
            <p className="text-brand-muted-foreground mb-4">
              Your funds have been sent to your wallet address.
            </p>
            
            <div className="mt-4 text-left p-3 border rounded bg-gray-50 dark:bg-gray-800">
              <p><Text strong>Amount:</Text> {withdrawalStatus?.amount} USDC</p>
              <p><Text strong>Address:</Text> {withdrawalStatus?.walletAddress}</p>
              {withdrawalStatus?.circleDetails?.txHash && (
                <p>
                  <Text strong>Transaction Hash:</Text> {withdrawalStatus.circleDetails.txHash}
                </p>
              )}
            </div>
            
            <Button 
              className="mt-6 bg-brand-primary" 
              onClick={() => {
                setIsModalOpen(false);
                setCurrentStep(0);
              }}
            >
              Close
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={showWithdrawalModal}
        className="text-xs px-2 py-1"
      >
        Withdraw
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <WalletOutlined />
            <span>Withdraw USDC</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Steps current={currentStep} className="mb-6">
          <Step title="Request" />
          <Step title="Processing" />
          <Step title="Complete" />
        </Steps>
        
        {renderStepContent()}
      </Modal>
    </>
  );
};