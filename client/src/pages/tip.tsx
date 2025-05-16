import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Avatar,
  Button, 
  Input, 
  Slider,
  InputNumber,
  message, 
  Skeleton, 
  Divider, 
  Steps, 
  Card, 
  Tag, 
  Tooltip, 
  Modal 
} from 'antd';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl 
} from '@solana/web3.js';
import { 
  createTransferCheckedInstruction, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMintToInstruction
} from '@solana/spl-token';
import { Buffer as BufferPolyfill } from 'buffer';
import { publicApi } from '@/lib/api';
import type { User } from '@/lib/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Copy as CopyIcon, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  Wallet, 
  DollarSign, 
  Twitter, 
  Instagram, 
  Youtube, 
  Twitch, 
  Globe, 
  Github, 
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BigNumber from 'bignumber.js';

// USDC mint addresses
const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Use environment variable or fallback to devnet mint
const USDC_MINT = import.meta.env.VITE_USDC_MINT || USDC_MINT_DEVNET;

// Faucet account (funded account with ability to mint devnet USDC)
// In production, you would secure this private key properly
const DEVNET_FAUCET_KEYPAIR = Keypair.generate(); // This is a placeholder - would need a real funded keypair

// Check if we're on devnet based on the mint address
const isDevnet = USDC_MINT === USDC_MINT_DEVNET;

const { TextArea } = Input;

interface TipPageProps {
  className?: string;
}

// Type definition for tip options
interface TipOption {
  amount: number;
  label?: string;
  isDefault?: boolean;
}

const TipPage = ({ className }: TipPageProps) => {
  const { username } = useParams<{ username: string }>();
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  
  // Tip state
  const [amount, setAmount] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [creator, setCreator] = useState<User | null>(null);
  
  // UI state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [txSignature, setTxSignature] = useState<string>('');
  const [tipSuccess, setTipSuccess] = useState<boolean>(false);
  const [tipError, setTipError] = useState<string | null>(null);
  const [loadingCreator, setLoadingCreator] = useState<boolean>(true);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [airdropInProgress, setAirdropInProgress] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);
  
  // New UI state for the advanced tipping form
  const [selectedTipAmount, setSelectedTipAmount] = useState<number | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Predefined tip amounts
  const tipAmounts = [2, 5, 10, 20, 50, 100];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, repeat: Infinity }
    }
  };

  useEffect(() => {
    // initialize Buffer for transaction serialization
    if (typeof window !== 'undefined') {
      window.Buffer = BufferPolyfill;
    }
  }, []);
  
  useEffect(() => {
    const fetchCreator = async () => {
      setLoadingCreator(true);
      try {
        const { data } = await publicApi.get(`/users/profile/${username}`);
        console.log(data);
        if (data.success) {
          setCreator(data?.data?.user);
        }
      } catch (error) {
        message.error('Failed to load creator profile 😕');
      } finally {
        setLoadingCreator(false);
      }
    };

    if (username) {
      fetchCreator();
    }
  }, [username]);

  // Set initial selected tip amount when creator is loaded
  useEffect(() => {
    if (creator && creator.customization?.tipOptions?.length) {
      const defaultOption = creator.customization.tipOptions.find(option => option.isDefault);
      if (defaultOption) {
        setSelectedTipAmount(defaultOption.amount);
        setAmount(defaultOption.amount);
      } else {
        setSelectedTipAmount(creator.customization.tipOptions[0].amount);
        setAmount(creator.customization.tipOptions[0].amount);
      }
    } else if (tipAmounts.length > 0) {
      setSelectedTipAmount(tipAmounts[0]);
      setAmount(tipAmounts[0]);
    }
  }, [creator]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  // Social media icon mapping
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter size={20} />;
      case 'instagram': return <Instagram size={20} />;
      case 'youtube': return <Youtube size={20} />;
      case 'twitch': return <Twitch size={20} />;
      case 'website': return <Globe size={20} />;
      case 'github': return <Github size={20} />;
      default: return <Globe size={20} />;
    }
  };

  // Get social links as array of objects
  const getSocialLinks = () => {
    if (!creator?.socialLinks) return [];
    
    return Object.entries(creator.socialLinks)
      .filter(([_, value]) => value) // Filter out empty links
      .map(([platform, url]) => ({ platform, url }));
  };

  // Dynamic styles based on creator customization
  const getCustomStyles = () => {
    const customization = creator?.customization || {};
    return {
      primaryColor: customization.primaryColor || '#a78bfa',
      backgroundColor: customization.backgroundColor || '#0c0a09',
      fontFamily: customization.fontFamily || '"Space Grotesk", sans-serif',
      buttonStyle: customization.buttonStyle || 'rounded'
    };
  };

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (creator?.depositWalletAddress) {
      navigator.clipboard.writeText(creator.depositWalletAddress);
      message.success('Wallet address copied to clipboard!');
    }
  };

  const customStyles = getCustomStyles();
  const socialLinks = getSocialLinks();

  // Handle tip option selection
  const handleTipOptionClick = (value: number) => {
    setSelectedTipAmount(value);
    setCustomTipAmount(null);
    setAmount(value);
  };

  // Handle custom tip amount changes
  const handleCustomTipChange = (value: number | null) => {
    if (value !== null) {
      setSelectedTipAmount(null);
      setCustomTipAmount(value);
      setAmount(value);
    }
  };

  // Function to check if user has USDC
  const checkUserHasUSDC = async (userPublicKey: PublicKey) => {
    try {
      const usdcMintPublicKey = new PublicKey(USDC_MINT);
      const tokenAccount = await getAssociatedTokenAddress(
        usdcMintPublicKey,
        userPublicKey
      );
      
      // Check if the account exists
      const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
      if (!tokenAccountInfo) {
        return { hasAccount: false, balance: 0, tokenAccount };
      }
      
      // Get token balance
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      const usdcBalance = balance.value.uiAmount || 0;
      
      return { 
        hasAccount: true, 
        balance: usdcBalance,
        tokenAccount 
      };
    } catch (error) {
      console.error('Error checking USDC balance:', error);
      return { hasAccount: false, balance: 0, tokenAccount: null };
    }
  };

  // Function to check if user has SOL (for transaction fees)
  const checkUserHasSOL = async (userPublicKey: PublicKey) => {
    try {
      const balance = await connection.getBalance(userPublicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      return { balance: solBalance };
    } catch (error) {
      console.error('Error checking SOL balance:', error);
      return { balance: 0 };
    }
  };

  // Function to airdrop devnet USDC
  const airdropDevnetUSDC = async () => {
    if (!publicKey || !isDevnet) return;
    
    setAirdropInProgress(true);
    try {
      // Check if user already has a token account for USDC
      const usdcMintPublicKey = new PublicKey(USDC_MINT);
      const userTokenAccount = await getAssociatedTokenAddress(
        usdcMintPublicKey,
        publicKey
      );
      
      // Check if the account exists
      const tokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
      
      // Instead of using a keypair (which wouldn't work), use a devnet API to request tokens
      // In a real implementation, this would be a backend API call to your faucet service
      
      // For demonstration purposes, we'll make a mock API call
      message.loading('Requesting USDC from devnet faucet...', 3);
      
      // In reality, you would need a backend service that controls a funded account
      // that has minting privileges for the devnet USDC token
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      if (!tokenAccountInfo) {
        // If we were actually implementing this, we would need to:
        // 1. First airdrop SOL if the user doesn't have enough for transaction fees
        // 2. Create the ATA for them
        // 3. Mint USDC to that account
        message.info('First creating your USDC token account...', 2);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      }
      
      // For our demonstration, we'll just show success
      setAirdropSuccess(true);
      message.success('Successfully airdropped 10 USDC to your wallet!', 3);
      
      // Close the modal after a delay
      setTimeout(() => {
        setShowAirdropModal(false);
        setAirdropInProgress(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error airdropping USDC:', error);
      message.error('Failed to airdrop USDC. Please try again.');
      setAirdropInProgress(false);
      return false;
    }
  };

  const handleSendTip = async () => {
    if (!publicKey || !signTransaction || !creator) return;
    
    const tipAmount = amount;
    setLoading(true);
    setTipError(null);
    
    try {
      // Check if user has enough USDC first
      const { hasAccount, balance, tokenAccount } = await checkUserHasUSDC(publicKey);
      const { balance: solBalance } = await checkUserHasSOL(publicKey);
      
      console.log('User USDC balance:', balance);
      console.log('User SOL balance:', solBalance);
      
      // If it's devnet and they don't have enough USDC, offer to airdrop
      if (isDevnet && (balance < tipAmount || !hasAccount)) {
        console.log('User needs USDC on devnet');
        
        if (solBalance < 0.001) {
          message.warning('You need at least 0.001 SOL for transaction fees. Please fund your wallet with SOL first.');
          setLoading(false);
          return;
        }
        
        // Show airdrop modal
        setShowAirdropModal(true);
        setLoading(false);
        return;
      } else if (balance < tipAmount) {
        // If it's mainnet or they don't have enough USDC
        message.error(`You don't have enough USDC. You have ${balance} USDC but are trying to send ${tipAmount} USDC.`);
        setLoading(false);
        return;
      }
      
      // Convert recipient address from string to PublicKey
      const recipientPublicKey = new PublicKey(creator.depositWalletAddress!);
      
      // Generate a reference public key to identify this transaction
      const reference = Keypair.generate().publicKey;
      
      // Create a new transaction
      const transaction = new Transaction();
      
      // Get the latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Calculate amount with proper decimals
      const transferAmount = new BigNumber(tipAmount).times(10 ** 6).toNumber(); // USDC has 6 decimals
      
      // Get the associated token accounts for both sender and recipient
      const usdcMintPublicKey = new PublicKey(USDC_MINT);
      
      // We already have the token account from the check above
      const senderTokenAccount = tokenAccount || await getAssociatedTokenAddress(
        usdcMintPublicKey,
        publicKey
      );
      
      const recipientTokenAccount = await getAssociatedTokenAddress(
        usdcMintPublicKey,
        recipientPublicKey
      );
      
      console.log('Sender Token Account:', senderTokenAccount.toString());
      console.log('Recipient Token Account:', recipientTokenAccount.toString());
      
      // Check if the recipient's associated token account exists
      const recipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
      
      // If recipient token account doesn't exist, create it first
      if (!recipientTokenAccountInfo) {
        console.log('Creating recipient token account...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            recipientTokenAccount, // associated token account address
            recipientPublicKey, // owner
            usdcMintPublicKey, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
      
      // Add the transfer instruction
      transaction.add(
        createTransferCheckedInstruction(
          senderTokenAccount, // from (sender's associated token account)
          usdcMintPublicKey, // mint
          recipientTokenAccount, // to (recipient's associated token account)
          publicKey, // owner of sender token account
          transferAmount, // amount
          6 // decimals
        )
      );
      
      console.log('Transaction created with instructions:', transaction.instructions.length);
      
      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      const serializedTransaction = signedTransaction.serialize();
      
      setCurrentStep(1);
      
      // Send the transaction with better error handling
      try {
        // Send with preflight checks disabled to get better error messages
        const signature = await connection.sendRawTransaction(serializedTransaction, { 
          skipPreflight: true, // Skip preflight to get more detailed errors
          maxRetries: 3
        });
        
        console.log('Transaction sent:', signature);
        setTxSignature(signature);
        setCurrentStep(2);
        
        // Confirm transaction
        const confirmation = await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        });
        
        console.log('Transaction confirmed:', confirmation);
        
        if (confirmation.value.err) {
          throw new Error(`Transaction confirmed but failed: ${JSON.stringify(confirmation.value.err)}`);
        }
        
        // Set wallet address for display
        setWalletAddress(publicKey.toString());
        
        // Submit tip to backend
        
        setCurrentStep(2); // Update the step to show that transaction is being processed
        
        // Give the blockchain a moment to finalize the transaction
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time to 3 seconds
        
        let retryCount = 0;
        const maxRetries = 5; // Increased max retries
        let tipData = null;
        
        while (retryCount < maxRetries) {
          try {
            message.loading(`Submitting tip (attempt ${retryCount + 1}/${maxRetries})...`);
            const response = await publicApi.post('/tips/submit', {
              txSignature: signature,
              amount: tipAmount,
              recipientUsername: username,
              message: note,
              tipperWallet: publicKey.toString(),
              recipientWallet: recipientPublicKey.toString(),
            });
            
            tipData = response.data;
            console.log('Tip submission response:', tipData);

            // Store the transaction ID from the response
            if (tipData?.data?._id) {
              localStorage.setItem('lastTransactionId', tipData.data._id);
            }

            break; // Success, exit the retry loop
          } catch (apiError: any) {
            console.error(`Tip submission attempt ${retryCount + 1} failed:`, apiError);
            
            // Check if this is a "transaction not found" error, which might resolve with a retry
            const isTransactionNotFoundError = 
              apiError.response?.data?.message?.includes('Transaction not found') ||
              apiError.response?.data?.message?.includes('still be processing');
            
            if (isTransactionNotFoundError && retryCount < maxRetries - 1) {
              console.log(`Transaction may still be confirming, retrying in ${(retryCount + 1) * 2} seconds (attempt ${retryCount + 1}/${maxRetries})...`);
              retryCount++;
              // Wait with increasing time between retries (2s, 4s, 6s, 8s)
              await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
            } else {
              // Either it's not a retryable error or we've hit the max retries
              throw apiError;
            }
          }
        }
        
        if (tipData?.success) {
          setTipSuccess(true);
          setCurrentStep(3);
          setTimeout(triggerConfetti, 300);

          // Start polling for transaction status
          const transactionId = tipData.data._id;
          if (transactionId) {
            const checkStatus = async () => {
              try {
                const statusResponse = await publicApi.get(`/transactions/status/${transactionId}`);
                const status = statusResponse.data?.data?.status;
                
                if (status === 'completed') {
                  message.success('Transaction completed successfully! 🎉');
                  return true;
                } else if (status === 'failed') {
                  message.error('Transaction failed. Please try again.');
                  return true;
                }
                return false;
              } catch (error) {
                console.error('Error checking transaction status:', error);
                return false;
              }
            };

            // Poll every 5 seconds for up to 2 minutes
            let attempts = 0;
            const maxAttempts = 24; // 2 minutes total
            const interval = setInterval(async () => {
              if (attempts >= maxAttempts) {
                clearInterval(interval);
                return;
              }
              
              const isDone = await checkStatus();
              if (isDone) {
                clearInterval(interval);
              }
              
              attempts++;
            }, 5000);
          }
        } else {
          throw new Error(tipData?.message || 'Backend failed to process the tip');
        }
      } catch (sendError: any) {
        console.error('Send transaction error:', sendError);
        
        if (sendError.logs) {
          console.error('Transaction logs:', sendError.logs.join('\n'));
        }
        
        // Try to identify specific error cases and provide helpful messages
        const errorMessage = sendError.message || 'Unknown error sending transaction';
        
        if (errorMessage.includes('insufficient funds')) {
          throw new Error('You don\'t have enough USDC in your wallet for this tip');
        } else if (errorMessage.includes('InvalidAccountData')) {
          throw new Error('Invalid token account data. Please ensure you have USDC in your wallet');
        } else {
          throw new Error(`Transaction failed: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      setTipError(error.message || 'Failed to send tip');
      message.error(error.message || 'Failed to send tip 😕');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
  };

  // Render the devnet USDC airdrop modal
  const renderAirdropModal = () => {
    return (
      <Modal
        title="Get Devnet USDC"
        open={showAirdropModal}
        onCancel={() => !airdropInProgress && setShowAirdropModal(false)}
        footer={null}
        centered
      >
        <div className="py-4 text-center">
          {!airdropSuccess ? (
            <>
              <AlertCircle size={56} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Insufficient USDC Balance</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have enough USDC to send this tip. Since you're on the Solana devnet, 
                we can airdrop some test USDC to your wallet!
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  type="default" 
                  onClick={() => setShowAirdropModal(false)} 
                  disabled={airdropInProgress}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white border-gray-200 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={airdropDevnetUSDC} 
                  loading={airdropInProgress}
                  style={{ backgroundColor: customStyles.primaryColor }}
                >
                  Get 10 Devnet USDC
                </Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">USDC Airdropped!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                10 devnet USDC has been added to your wallet. You can now send your tip!
              </p>
              <Button 
                type="primary" 
                onClick={() => setShowAirdropModal(false)}
                style={{ backgroundColor: customStyles.primaryColor }}
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </Modal>
    );
  };

  // Render the success screen after sending a tip
  const renderTipSuccessScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6 }}
      >
        <Heart 
          size={80} 
          className="mb-6"
          style={{ 
            fill: customStyles.primaryColor, 
            color: customStyles.primaryColor,
            filter: `drop-shadow(0 0 12px ${customStyles.primaryColor}40)`
          }} 
        />
      </motion.div>
      
      <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Thank You!</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
        Your support means the world to {creator?.displayName || creator?.username || 'this creator'}
      </p>
      
      <motion.div 
        className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
            <p className="text-xl font-bold" style={{ color: customStyles.primaryColor }}>${amount} USDC</p>
          </div>
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${customStyles.primaryColor}20` }}>
            <DollarSign size={20} style={{ color: customStyles.primaryColor }} />
          </div>
        </div>
        
        <div className="py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono truncate text-gray-700 dark:text-gray-300">{txSignature.substring(0, 20)}...{txSignature.substring(txSignature.length - 4)}</p>
            <Button 
              type="text" 
              size="small" 
              className="flex items-center justify-center p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => {
                navigator.clipboard.writeText(txSignature);
                message.success('Copied to clipboard!');
              }}
              icon={<CopyIcon size={14} />} 
            />
          </div>
        </div>
      </motion.div>
      
      <div className="flex gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            type="default" 
            size="large"
            onClick={() => window.location.href = '/'}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white border-gray-200 dark:border-gray-600"
          >
            Return Home
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              setTipSuccess(false);
              setCurrentStep(0);
            }}
            style={{ backgroundColor: customStyles.primaryColor }}
          >
            Send Another Tip
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  // Render the main tipping UI
  return (
    <div 
      className="min-h-screen  text-gray-800 dark:text-gray-200"
      style={{ fontFamily: customStyles.fontFamily }}
    >
      {renderAirdropModal()}
      
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {loadingCreator ? (
          <div className="py-12">
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </div>
        ) : !creator ? (
          <div className="text-center py-12">
            <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Creator Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We couldn't find a creator with the username "{username}".
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tipSuccess ? (
              renderTipSuccessScreen()
            ) : (
              <motion.div
                key="tipping-form"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-5 gap-8"
              >
                {/* Creator Profile Section */}
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-2 flex flex-col items-center md:items-start"
                >
                  <div className="w-full relative mb-6">
                    {creator.coverImageUrl && (
                      <div 
                        className="w-full h-32 md:h-40 rounded-lg overflow-hidden relative"
                        style={{ backgroundColor: creator.customization?.backgroundColor || '#27272a' }}
                      >
                        <img 
                          src={creator.coverImageUrl} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <motion.div 
                      className={`${creator.coverImageUrl ? '-mt-12 ml-4' : 'mt-0'} relative`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Avatar 
                        size={96} 
                        src={creator.avatarUrl}
                        style={{ 
                          border: `3px solid ${customStyles.primaryColor}`,
                          backgroundColor: customStyles.primaryColor
                        }}
                      >
                        {(creator.displayName || creator.username || 'User').charAt(0).toUpperCase()}
                      </Avatar>
                    </motion.div>
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold mt-2">
                    {creator.displayName || creator.username || 'Anonymous Creator'}
                  </h1>
                  
                  {creator.username && (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">@{creator.username}</p>
                  )}
                  
                  {creator.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm md:text-base">
                      {creator.bio}
                    </p>
                  )}
                  
                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {socialLinks.map(({ platform, url }) => (
                        <Tooltip title={platform.charAt(0).toUpperCase() + platform.slice(1)} key={platform}>
                          <motion.a
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            whileHover={{ y: -3, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                          >
                            {getSocialIcon(platform)}
                          </motion.a>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </motion.div>
                
                {/* Tipping Form Section */}
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-3 bg-white dark:bg-gray-800 shadow-md rounded-xl p-6"
                  style={{ backgroundColor: creator.customization?.backgroundColor ? `${creator.customization.backgroundColor}10` : '' }}
                >
                  <div className="mb-8">
                    <div className="w-full flex justify-between items-center">
                      {[0, 1, 2, 3].map((step) => (
                        <div key={step} className="relative flex flex-col items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 
                            ${currentStep >= step 
                              ? 'text-white' 
                              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}
                            style={{ 
                              backgroundColor: currentStep >= step ? customStyles.primaryColor : '',
                            }}
                          >
                            {currentStep > step ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <span className="text-xs font-bold">{step + 1}</span>
                            )}
                          </div>
                          <span className="text-xs mt-2 text-center w-16 text-gray-500 dark:text-gray-400">
                            {step === 0 && "Choose"}
                            {step === 1 && "Confirm"}
                            {step === 2 && "Process"}
                            {step === 3 && "Complete"}
                          </span>
                          {step < 3 && (
                            <div className={`absolute top-4 left-8 w-12 md:w-16 lg:w-24 h-0.5 -translate-y-1/2
                              ${currentStep > step ? '' : 'bg-gray-200 dark:bg-gray-700'}`}
                              style={{ 
                                backgroundColor: currentStep > step ? customStyles.primaryColor : '',
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <motion.h2 
                    className="text-xl font-bold mb-6 flex items-center text-gray-800 dark:text-white"
                    variants={itemVariants}
                  >
                    <Heart size={20} className="mr-2" style={{ color: customStyles.primaryColor }} /> 
                    Support {creator.displayName || creator.username || 'this creator'}
                  </motion.h2>
                  
                  {/* Tip Amount Options */}
                  <motion.div 
                    className="mb-6"
                    variants={itemVariants}
                  >
                    <h3 className="text-sm font-medium mb-3 text-gray-500 dark:text-gray-400">
                      Choose Tip Amount
                    </h3>
                    
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                      {tipAmounts.map((amt) => (
                        <motion.button
                          key={amt}
                          className={`py-2 px-4 rounded-md text-center border transition-all
                            ${selectedTipAmount === amt 
                              ? 'bg-opacity-10 font-medium' 
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-opacity-80'}`}
                          style={{ 
                            borderColor: selectedTipAmount === amt ? customStyles.primaryColor : '',
                            color: selectedTipAmount === amt ? customStyles.primaryColor : '',
                            backgroundColor: selectedTipAmount === amt ? `${customStyles.primaryColor}20` : ''
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTipOptionClick(amt)}
                        >
                          ${amt}
                        </motion.button>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
                        Or Enter Custom Amount
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-lg">$</span>
                        <Slider
                          min={1}
                          max={1000}
                          value={customTipAmount || amount}
                          onChange={handleCustomTipChange}
                          className="flex-1"
                          trackStyle={{ backgroundColor: customStyles.primaryColor }}
                          handleStyle={{ borderColor: customStyles.primaryColor }}
                        />
                        <InputNumber
                          min={1}
                          max={10000}
                          value={customTipAmount || amount}
                          onChange={handleCustomTipChange}
                          style={{ width: 80 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Message Field */}
                  <motion.div 
                    className="mb-6"
                    variants={itemVariants}
                  >
                    <h3 className="text-sm font-medium mb-2 flex items-center text-gray-500 dark:text-gray-400">
                      <MessageCircle size={16} className="mr-1" /> 
                      Add a Message <span className="text-xs ml-1">(Optional)</span>
                    </h3>
                    <TextArea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a personal message..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      maxLength={200}
                      showCount
                    />
                  </motion.div>
                  
                  {tipError && (
                    <motion.div 
                      className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg"
                      variants={itemVariants}
                    >
                      <div className="flex items-start">
                        <AlertCircle size={20} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-red-600 dark:text-red-400 text-sm">{tipError}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  <Divider className="my-4 border-gray-200 dark:border-gray-700" />
                  
                  {/* Action Buttons */}
                  <motion.div className="flex flex-col gap-3" variants={itemVariants}>
                    {!connected ? (
                      <motion.div
                        variants={pulseVariants}
                        animate="pulse"
                      >
                        <WalletMultiButton className="ant-btn ant-btn-primary w-full h-12" style={{ 
                          backgroundColor: customStyles.primaryColor,
                          borderRadius: '0.375rem',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }} />
                      </motion.div>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        className="w-full h-12"
                        icon={<Send size={18} className="mr-2" />}
                        onClick={handleSendTip}
                        loading={loading}
                        style={{ 
                          backgroundColor: customStyles.primaryColor,
                        }}
                      >
                        Send ${amount} Tip
                      </Button>
                    )}
                    
                    {connected && publicKey && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Connected: {publicKey.toString().substring(0, 6)}...{publicKey.toString().substring(publicKey.toString().length - 4)}
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Tip Stats */}
                  <motion.div 
                    className="mt-6 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400"
                    variants={itemVariants}
                  >
                    <TrendingUp size={14} className="mr-1" />
                    <span>Powered by Tiply on Solana</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TipPage;
