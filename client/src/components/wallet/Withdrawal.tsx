import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, Form, InputNumber, Spin } from 'antd';
import { WalletOutlined, LoadingOutlined } from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { transactionService, WithdrawalRequest } from '@/services/transaction.service';

interface WithdrawalProps {
  balance: number;
  onWithdraw?: (address: string, amount: number) => Promise<boolean>;
}

export const Withdrawal: React.FC<WithdrawalProps> = ({ balance, onWithdraw }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, refreshUser } = useUser();

  // When user data changes, set the default withdrawal address if available
  useEffect(() => {
    if (user?.withdrawalWalletAddress && form) {
      form.setFieldsValue({
        address: user.withdrawalWalletAddress
      });
    }
  }, [user, form]);

  const showWithdrawalModal = () => {
    setIsModalOpen(true);
    
    // Use withdrawalWalletAddress if available, otherwise leave empty
    form.setFieldsValue({
      address: user?.withdrawalWalletAddress || '',
      amount: balance > 0 ? Math.min(balance, 5) : 0
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: { address: string; amount: number }) => {
    try {
      setIsLoading(true);

      // If custom onWithdraw handler is provided, use it
      if (onWithdraw) {
        const success = await onWithdraw(values.address, values.amount);
        if (success) {
          form.resetFields();
          setIsModalOpen(false);
        }
        return;
      }

      // Otherwise use our transaction service
      const withdrawalData: WithdrawalRequest = {
        address: values.address,
        amount: values.amount
      };

      await transactionService.createWithdrawal(withdrawalData);
      
      // Refresh user data to get updated withdrawal address
      await refreshUser();
      
      form.resetFields();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
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
    return Promise.resolve();
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
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ 
            address: user?.withdrawalWalletAddress || '',
            amount: balance > 0 ? Math.min(balance, 5) : 0 
          }}
        >
          <div className="mb-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
            <p className="text-brand-muted-foreground text-sm">
              Available balance: <span className="font-semibold">${balance.toFixed(2)} USDC</span>
            </p>
          </div>

          <Form.Item
            label="Wallet Address"
            name="address"
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
              min={0.01}
              max={balance}
              step={0.01}
              precision={2}
              placeholder="0.00"
              disabled={balance <= 0}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
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
      </Modal>
    </>
  );
};