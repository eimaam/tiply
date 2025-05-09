import { Circle, CircleEnvironments } from "@circle-fin/circle-sdk";
import { CIRCLE_ENV } from "../config/env.config";
import {
  CircleDeveloperControlledWalletsClient,
  CreateWalletsInput,
  initiateDeveloperControlledWalletsClient,
} from "@circle-fin/developer-controlled-wallets";
import {
  Blockchain,
  AccountType,
} from "@circle-fin/developer-controlled-wallets";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

export const circleClient = () => {
  const apiKey = CIRCLE_ENV.apiKey;
  const entitySecret = CIRCLE_ENV.entitySecret;

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: apiKey as string,
    entitySecret: entitySecret as string,
  });

  return client;
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
}
