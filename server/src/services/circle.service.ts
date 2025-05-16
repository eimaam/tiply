import { Circle, CircleEnvironments } from "@circle-fin/circle-sdk";
import { CIRCLE_ENV, SOLANA } from "../config/env.config";
import {
  CircleDeveloperControlledWalletsClient,
  CreateWalletsInput,
  initiateDeveloperControlledWalletsClient,
  Blockchain,
  TokenBlockchain,
  AccountType,
  FeeLevel,
  CreateTransferTransactionInput,
  WithIdempotencyKey,
  TokenAddressAndBlockchainInput,
  FeeConfiguration,
  TransactionResponseData,
  TransactionState,
  GetTransactionInput,
  CreateTransferTransactionForDeveloperResponseData,
  TransactionData,
  TransactionResponse,
  TransactionType,
  CreateTransactionInput,
  Fee
} from "@circle-fin/developer-controlled-wallets";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

// Define transaction response interface based on Circle API
interface CircleTransactionResponse {
  id: string;
  blockchain: string;
  tokenId: string;
  walletId: string;
  sourceAddress: string;
  destinationAddress: string;
  type: TransactionType;
  custodyType: string;
  state: TransactionState;
  amounts: string[];
  nfts: any;
  txHash: string;
  blockHash: string;
  blockHeight: number;
  networkFee: string;
  firstConfirmDate: string;
  operation: string;
  feeLevel: string;
  estimatedFee: {
    gasLimit: string;
    baseFee: string;
    priorityFee: string;
    maxFee: string;
  };
  refId: string;
  abiParameters: any;
  createDate: string;
  updateDate: string;
  errorCode?: string;
  failureReason?: string;
}

/**
 * Circle client
 * @returns Circle client
 */
const circleClient = (): CircleDeveloperControlledWalletsClient => {
  return initiateDeveloperControlledWalletsClient({
    apiKey: CIRCLE_ENV.apiKey || '',
    entitySecret: CIRCLE_ENV.entitySecret || '',
  });
};

export class CircleService {
  /**
   * Create a new developer-controlled wallet for a user.
   */
  static async createWallet(userId: string) {
    const client = circleClient();

    // Generate UUID for idempotencyKey as required by Circle API
    const idempotencyKey = uuidv4();

    const walletReq: CreateWalletsInput = {
      idempotencyKey: idempotencyKey,
      blockchains: ["SOL-DEVNET" as Blockchain],
      walletSetId: CIRCLE_ENV.walletSetId as string,
      count: 1,
      metadata: [
        {
          name: `Wallet for ${userId}`,
          refId: userId,
        },
      ],
    };

    let data;

    try {
      const response = await client.createWallets(walletReq);

      const walletResponse = response.data?.wallets[0];

      if (!walletResponse) {
        logger.error("🚨 Wallet creation failed: No wallet response");
        throw new Error("Failed to create wallet");
      }

      data = {
        id: walletResponse.id,
        address: walletResponse.address,
        blockchain: walletResponse.blockchain,
      };
    } catch (error: any) {
      console.dir(error?.response, { depth: null });
      logger.error(
        `Error creating wallet: ${
          error?.response || error?.message || "Unknown error"
        }`
      );
      throw new Error("Failed to create wallet");
    }

    return data;
  }

  /**
   * Get the USDC balance for a user's Circle wallet
   * @param walletId - The Circle wallet ID
   * @returns The balance of USDC as a number, or 0 if not found or on error
   */
  static async getWalletUSDCBalance(walletId: string): Promise<number> {
    if (!walletId) {
      logger.warn('⚠️ Attempted to fetch balance for null/undefined walletId');
      return 0;
    }

    try {
      const client = circleClient();
      const response = await this.getWalletBalancesFromCircle(walletId, client);
      
      // Find the USDC balance in token balances
      const usdcBalance = response?.tokenBalances?.find((bal: any) => 
        (bal.token?.symbol === 'USDC') || 
        (bal.token?.name?.includes('USD Coin'))
      );

      if (usdcBalance && usdcBalance.amount) {
        const balance = parseFloat(usdcBalance.amount);
        logger.info(`💰 Fetched balance for wallet ${walletId}: ${balance} USDC`);
        return balance;
      }

      logger.warn(`🤔 No USDC balance found for wallet ${walletId}`);
      return 0; // No USDC balance found
    } catch (error: any) {
      logger.error(`❌ Error fetching balance for wallet ${walletId}: ${error.message}`);
      return 0; // Return 0 on error
    }
  }

  /**
   * Make API call to Circle to get wallet balances
   * @param walletId - The Circle wallet ID
   * @param client - The Circle client
   * @returns The response from Circle API with wallet balances
   */
  private static async getWalletBalancesFromCircle(
    walletId: string, 
    client: CircleDeveloperControlledWalletsClient
  ): Promise<any> {
    try {
      logger.info(`📞 Calling Circle API to get balances for wallet ${walletId}`);
      const response = await client.getWalletTokenBalance({ id: walletId });
      console.dir(response, { depth: null });
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Failed to fetch balance from Circle: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate platform fee for a given amount
   * @param amount - The tip amount
   * @returns The fee amount
   */
  static calculatePlatformFee(amount: number): number {
    // 2.5% platform fee
    return parseFloat((amount * 0.025).toFixed(2));
  }

  /**
   * Process a USDC transfer between wallets
   * @param senderAddress - The sender's wallet address
   * @param recipientAddress - The recipient's wallet address
   * @param amount - Amount in USDC to transfer
   * @param idempotencyKey - Unique key to prevent duplicate transfers
   */
  static async processUSDCTransfer(
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    idempotencyKey: string
  ) {
    const client = circleClient();

    try {
      logger.info(`💸 Processing USDC transfer of ${amount} from ${senderAddress} to ${recipientAddress}`);
      
      const transferReq = {
        idempotencyKey,
        source: {
          type: 'wallet',
          id: senderAddress
        },
        destination: {
          type: 'wallet',
          id: recipientAddress
        },
        amount: {
          amount: amount.toString(),
          currency: 'USD'
        },
        tokenId: CIRCLE_ENV.usdcTokenId
      };

      const response = await client.transfer(transferReq);
      
      if (!response.data?.id) {
        throw new Error('Transfer failed: No transaction ID received');
      }

      logger.info(`✨ Transfer successful! Transaction ID: ${response.data.id}`);
      return {
        transactionId: response.data.id,
        status: response.data.status
      };
    } catch (error: any) {
      logger.error(`❌ Transfer failed: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get transfer status from Circle
   * @param transferId - The Circle transfer ID
   */
  static async getTransferStatus(transferId: string) {
    const client = circleClient();

    try {
      const response = await client.getTransfer(transferId);
      return response.data?.status || 'unknown';
    } catch (error: any) {
      logger.error(`❌ Error getting transfer status: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Withdraw USDC from Circle wallet to user's external wallet address
   * @param walletId - The Circle wallet ID (source)
   * @param destinationAddress - The destination Solana wallet address
   * @param amount - Amount in USDC to withdraw
   * @returns Transaction ID and status
   */
  static async withdrawToExternalWallet(
    walletId: string,
    destinationAddress: string,
    amount: number
  ) {
    const client = circleClient();
    const idempotencyKey = uuidv4();

    try {
      logger.info(`🔄 Initiating withdrawal of ${amount} USDC from wallet ${walletId} to ${destinationAddress}`);
      
      if (!CIRCLE_ENV.usdcTokenId) {
        throw new Error('USDC token ID not configured');
      }

      // Calculate network fee (we'll use low fee level)
      const feeConfig: FeeConfiguration<FeeLevel> = {
        type: 'level',
        config: {
          feeLevel: "LOW"
        }
      };

      // Prepare transaction input
      const transactionInput: CreateTransferTransactionInput = {
        walletId,
        tokenId: CIRCLE_ENV.usdcTokenId,
        destinationAddress,
        amount: [amount.toString()],
        fee: feeConfig,
        refId: `withdrawal-${idempotencyKey}`
      };

      // Call Circle API to create and execute the transaction
      const response = await client.createTransaction(transactionInput);
      
      if (!response.data) {
        throw new Error('Withdrawal failed: No transaction data received');
      }

      const txData = response.data;

      logger.info(`✅ Withdrawal transaction created! Transaction ID: ${txData.id}`);
      
      // Return transaction details with proper typing
      return {
        transactionId: txData.id,
        status: txData.state || TransactionState.Initiated,
        amount: parseFloat(amount.toString()),
        destinationAddress,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error(`❌ Withdrawal failed: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
      console.dir(error?.response?.data?.errors || error, { depth: null });
      throw error;
    }
  }

  /**
   * Check status of a withdrawal transaction
   * @param transactionId - Circle transaction ID
   * @returns Transaction status and details
   */
  static async getWithdrawalStatus(transactionId: string) {
    const client = circleClient();

    try {
      const input: GetTransactionInput = {
        id: transactionId
      };

      const response = await client.getTransaction(input);
      
      if (!response.data) {
        throw new Error('Failed to get transaction details');
      }

      const transaction = response.data as CircleTransactionResponse;

      return {
        id: transaction.id,
        state: transaction.state,
        transactionType: transaction.type,
        walletId: transaction.walletId,
        sourceAddress: transaction.sourceAddress,
        destinationAddress: transaction.destinationAddress,
        amount: transaction.amounts?.[0],
        blockchain: transaction.blockchain,
        txHash: transaction.txHash,
        networkFee: transaction.networkFee,
        createDate: transaction.createDate,
        updateDate: transaction.updateDate,
        errorCode: transaction.errorCode,
        failureReason: transaction.failureReason
      };
    } catch (error: any) {
      logger.error(`❌ Error getting withdrawal status: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  }
}
