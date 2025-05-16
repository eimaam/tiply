import dotenv from "dotenv";
dotenv.config();

export type NodeEnvType = "development" | "production";
const NodeEnv = (process.env.NODE_ENV as NodeEnvType) || "development";
const PORT: number = parseInt(process.env.PORT || "8000", 10);

const DATABASE = {
  development:
    process.env.DEV_MONGODB_URI,
  production:
    process.env.PROD_MONGODB_URI
};

// JWT configuration
const JWT = {
  SECRET: process.env.JWT_SECRET as string,
  EXPIRY: (process.env.JWT_EXPIRY as string) || "30m", // Default access token expiry (e.g., 30 minutes)
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  REFRESH_EXPIRY: (process.env.JWT_REFRESH_EXPIRY as string) || "7d", // Default refresh token expiry (7 days to match cookie)
};

// circle
const CIRCLE_ENV = {
  apiURL:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_API_URL
      : process.env.CIRCLE_API_URL,
  apiKey:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_API_KEY
      : process.env.CIRCLE_API_KEY,
  entitySecret:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_ENTITY_SECRET
      : process.env.CIRCLE_ENTITY_SECRET,
  webhookSecret:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_WEBHOOK_SECRET
      : process.env.CIRCLE_WEBHOOK_SECRET,
  webhookUrl:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_WEBHOOK_URL
      : process.env.CIRCLE_WEBHOOK_URL,
  walletSetId:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_WALLET_SET_ID
      : process.env.CIRCLE_WALLET_SET_ID,
  usdcTokenId:
    NodeEnv === "development"
      ? process.env.CIRCLE_SANDBOX_USDC_TOKEN_ID
      : process.env.CIRCLE_USDC_TOKEN_ID,
  isSandbox: NodeEnv === "development" ? true : false,
  isProduction: NodeEnv === "production" ? true : false,
  isTest: NodeEnv === "development" ? true : false,
};

const SOLANA = {
  RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  USDC_MINT: process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC mint
}

const MONGODB_URI =
  NodeEnv === "development" ? DATABASE.development : DATABASE.production;

export { NodeEnv, PORT, DATABASE, MONGODB_URI, JWT, CIRCLE_ENV, SOLANA };
