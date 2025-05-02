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
  EXPIRY: (process.env.JWT_EXPIRY as string) || "7d",
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
  isSandbox: NodeEnv === "development" ? true : false,
  isProduction: NodeEnv === "production" ? true : false,
  isTest: NodeEnv === "development" ? true : false,
};

const MONGODB_URI =
  NodeEnv === "development" ? DATABASE.development : DATABASE.production;

export { NodeEnv, PORT, DATABASE, MONGODB_URI, JWT, CIRCLE_ENV };
