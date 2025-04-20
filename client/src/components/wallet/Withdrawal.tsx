import React, { useState } from 'react';
import { Button, Form, Input, Modal, Radio, Space, Typography, message, Spin } from 'antd';
import { WalletOutlined, LoadingOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Wallet provider types
type WalletProvider = {
  name: string
  icon: string
  bgColor: string
}

// Define props interface for the component
interface WithdrawalProps {
  balance: number;
  onWithdraw: (address: string, amount: number) => Promise<boolean>;
}

export const Withdrawal: React.FC<WithdrawalProps> = ({ 
  balance,
  onWithdraw
}) => {
  // State for withdrawal flow
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<'connect' | 'manual'>('connect');
  const [walletAddress, setWalletAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [amount, setAmount] = useState(balance.toString());
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [withdrawalStep, setWithdrawalStep] = useState<'wallet' | 'amount' | 'confirm' | 'processing' | 'success'>('wallet');
  
  // Form for withdrawal amount
  const [form] = Form.useForm();
  
  // Constants
  const MIN_WITHDRAWAL = 5; // Minimum withdrawal amount in USDC
  const NETWORK_FEE = 0.01; // Network fee in USDC
  const SERVICE_FEE = balance * 0.01; // 1% service fee
  const TOTAL_FEE = NETWORK_FEE + SERVICE_FEE;
  
  // Available wallet providers
  const walletProviders: WalletProvider[] = [
    {
      name: 'Phantom',
      icon: '👻',
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-700'
    },
    {
      name: 'Solflare',
      icon: '☀️',
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-700'
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-700'
    }
  ];
  
  // Validate wallet address
  const validateWalletAddress = (address: string): boolean => {
    // Basic Solana wallet address validation
    return address.length === 44;
  };
  
  // Handle wallet address change
  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWalletAddress(value);
    setIsAddressValid(value === '' || validateWalletAddress(value));
  };
  
  // Connect wallet handler
  const handleConnectWallet = (providerName: string) => {
    setIsConnecting(true);
    setConnectingProvider(providerName);
    
    // Simulate wallet connection (replace with actual wallet connection logic)
    setTimeout(() => {
      const simulatedAddress = 'FZLEwSXi1SoygP5bhK9vvJqVes9JLFj9jfTxnJX3fvy2';
      setWalletAddress(simulatedAddress);
      setIsConnecting(false);
      setConnectingProvider(null);
      // Move to amount step
      setWithdrawalStep('amount');
    }, 1500);
  };
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove non-numeric characters except decimal point
    value = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    setAmount(value);
  };
  
  // Get maximum withdrawal amount (balance minus fees)
  const getMaxAmount = (): number => {
    const max = balance - NETWORK_FEE;
    return max > 0 ? parseFloat(max.toFixed(2)) : 0;
  };
  
  // Set maximum amount
  const handleMaxAmount = () => {
    setAmount(getMaxAmount().toString());
  };
  
  // Process withdrawal
  const processWithdrawal = async () => {
    setWithdrawalStep('processing');
    
    try {
      // Convert amount to number
      const amountNumber = parseFloat(amount);
      
      // Validate withdrawal amount
      if (isNaN(amountNumber) || amountNumber <= 0) {
        message.error('Please enter a valid withdrawal amount');
        setWithdrawalStep('amount');
        return;
      }
      
      if (amountNumber < MIN_WITHDRAWAL) {
        message.error(`Minimum withdrawal amount is ${MIN_WITHDRAWAL} USDC`);
        setWithdrawalStep('amount');
        return;
      }
      
      if (amountNumber > getMaxAmount()) {
        message.error('Insufficient balance for this withdrawal amount and fees');
        setWithdrawalStep('amount');
        return;
      }
      
      // Call withdrawal function
      const success = await onWithdraw(walletAddress, amountNumber);
      
      if (success) {
        setWithdrawalStep('success');
      } else {
        message.error('Withdrawal failed. Please try again.');
        setWithdrawalStep('confirm');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      message.error('An error occurred during withdrawal');
      setWithdrawalStep('confirm');
    }
  };
  
  // Reset and close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setWithdrawalStep('wallet');
    setWalletAddress('');
    setAmount(balance.toString());
    form.resetFields();
  };
  
  // Render modal content based on current step
  const renderModalContent = () => {
    switch (withdrawalStep) {
      case 'wallet':
        return (
          <div className="space-y-4">
            <Title level={4}>Withdraw Your Balance</Title>
            <Paragraph>
              You have <Text strong>{balance.toFixed(2)} USDC</Text> available to withdraw
            </Paragraph>
            
            <div className="mb-4">
              <Text strong>Choose Withdrawal Method</Text>
              <Radio.Group 
                onChange={(e) => setWithdrawalMethod(e.target.value)} 
                value={withdrawalMethod}
                className="mt-2 w-full"
              >
                <Space direction="vertical" className="w-full">
                  <Radio value="connect">Connect a wallet</Radio>
                  <Radio value="manual">Enter wallet address manually</Radio>
                </Space>
              </Radio.Group>
            </div>
            
            {withdrawalMethod === 'connect' ? (
              <div className="space-y-4">
                <Text>Select a wallet provider:</Text>
                <div className="grid grid-cols-3 gap-3">
                  {walletProviders.map((provider) => (
                    <motion.div
                      key={provider.name}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={() => handleConnectWallet(provider.name)}
                        disabled={isConnecting}
                        className={`w-full h-auto py-4 text-white ${provider.bgColor}`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xl">{provider.icon}</span>
                          <span>{provider.name}</span>
                          {isConnecting && connectingProvider === provider.name && (
                            <Spin size="small" className="mt-1" />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Text>Enter your Solana wallet address:</Text>
                <Input
                  prefix={<WalletOutlined />}
                  placeholder="Solana wallet address"
                  value={walletAddress}
                  onChange={handleWalletAddressChange}
                  status={!isAddressValid && walletAddress ? 'error' : ''}
                  className="font-mono"
                />
                {!isAddressValid && walletAddress && (
                  <Text type="danger">Please enter a valid Solana wallet address</Text>
                )}
                {walletAddress && isAddressValid && (
                  <Text type="success">
                    <CheckCircleOutlined /> Valid wallet address
                  </Text>
                )}
                <Button 
                  type="primary" 
                  className="mt-4"
                  onClick={() => setWithdrawalStep('amount')}
                  disabled={!walletAddress || !isAddressValid}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'amount':
        return (
          <div className="space-y-4">
            <Title level={4}>Withdrawal Amount</Title>
            <Paragraph>
              You have <Text strong>{balance.toFixed(2)} USDC</Text> available to withdraw
            </Paragraph>
            
            <Form form={form} layout="vertical">
              <Form.Item 
                label="Withdrawal Amount (USDC)" 
                validateStatus={
                  parseFloat(amount) > getMaxAmount() || parseFloat(amount) < MIN_WITHDRAWAL 
                    ? 'error' 
                    : undefined
                }
                help={
                  parseFloat(amount) > getMaxAmount() 
                    ? 'Amount exceeds available balance after fees' 
                    : parseFloat(amount) < MIN_WITHDRAWAL
                      ? `Minimum withdrawal is ${MIN_WITHDRAWAL} USDC`
                      : undefined
                }
              >
                <Input
                  prefix="$"
                  value={amount}
                  onChange={handleAmountChange}
                  addonAfter={
                    <Button type="link" onClick={handleMaxAmount} size="small">
                      MAX
                    </Button>
                  }
                />
              </Form.Item>
            </Form>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex justify-between mb-2">
                <Text>Network Fee:</Text>
                <Text>${NETWORK_FEE.toFixed(2)}</Text>
              </div>
              <div className="flex justify-between mb-2">
                <Text>Service Fee (1%):</Text>
                <Text>${SERVICE_FEE.toFixed(2)}</Text>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between font-semibold">
                <Text strong>You will receive:</Text>
                <Text strong>${(parseFloat(amount || '0') - TOTAL_FEE).toFixed(2)}</Text>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button onClick={() => setWithdrawalStep('wallet')}>
                Back
              </Button>
              <Button 
                type="primary" 
                onClick={() => setWithdrawalStep('confirm')}
                disabled={
                  parseFloat(amount) > getMaxAmount() || 
                  parseFloat(amount) < MIN_WITHDRAWAL || 
                  isNaN(parseFloat(amount))
                }
              >
                Continue
              </Button>
            </div>
          </div>
        );
        
      case 'confirm':
        return (
          <div className="space-y-4">
            <Title level={4}>Confirm Withdrawal</Title>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex justify-between mb-2">
                <Text>Wallet:</Text>
                <Text className="font-mono">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</Text>
              </div>
              <div className="flex justify-between mb-2">
                <Text>Amount:</Text>
                <Text>${parseFloat(amount).toFixed(2)} USDC</Text>
              </div>
              <div className="flex justify-between mb-2">
                <Text>Fees:</Text>
                <Text>${TOTAL_FEE.toFixed(2)} USDC</Text>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between font-semibold">
                <Text strong>You will receive:</Text>
                <Text strong>${(parseFloat(amount) - TOTAL_FEE).toFixed(2)} USDC</Text>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 p-3 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded">
              <InfoCircleOutlined className="mt-1 flex-shrink-0" />
              <Text>Withdrawals typically process within minutes but may take up to 24 hours during periods of high network congestion.</Text>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button onClick={() => setWithdrawalStep('amount')}>
                Back
              </Button>
              <Button 
                type="primary" 
                onClick={processWithdrawal}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        );
        
      case 'processing':
        return (
          <div className="text-center py-8">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
            <Title level={4} className="mt-4">Processing Your Withdrawal</Title>
            <Paragraph>
              Please wait while we process your withdrawal...
            </Paragraph>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <Title level={4}>Withdrawal Successful!</Title>
            <Paragraph>
              ${parseFloat(amount).toFixed(2)} USDC has been sent to your wallet.
            </Paragraph>
            <Paragraph type="secondary">
              Transaction ID: {Math.random().toString(36).substring(2, 15)}
            </Paragraph>
            <Button 
              type="primary" 
              className="mt-4" 
              onClick={handleCloseModal}
            >
              Done
            </Button>
          </div>
        );
    }
  };
  
  return (
    <>
      <Button 
        type="primary" 
        onClick={() => setIsModalVisible(true)}
        disabled={balance <= 0}
      >
        Withdraw Funds
      </Button>
      
      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={500}
      >
        {renderModalContent()}
      </Modal>
      
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5 flex-shrink-0" />
          <div>
            <Text strong className="text-blue-700 dark:text-blue-300">Coming Soon: Bank Withdrawals</Text>
            <Paragraph className="text-blue-600 dark:text-blue-400 text-sm mt-1">
              We're adding direct bank withdrawal functionality that will allow you to transfer your earnings directly to your bank account without needing a third-party exchange.
            </Paragraph>
          </div>
        </div>
      </div>
    </>
  );
};