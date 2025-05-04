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
}
