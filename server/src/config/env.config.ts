import dotenv from "dotenv";
dotenv.config();

export type NodeEnvType = "development" | "production";
const NodeEnv = (process.env.NODE_ENV as NodeEnvType) || "development";
const PORT: number = parseInt(process.env.PORT || "8000", 10);

const DATABASE = {
  development:
    process.env.DEV_MONGODB_URI || "mongodb://localhost:27017/bexil-games-dev",
  production:
    process.env.PROD_MONGODB_URI ||
    "mongodb://localhost:27017/bexil-games-prod",
};

// JWT configuration
const JWT = {
    SECRET: process.env.JWT_SECRET as string,
    EXPIRY: process.env.JWT_EXPIRY as string || '7d',
};


const MONGODB_URI =
  NodeEnv === "development" ? DATABASE.development : DATABASE.production;

export { NodeEnv, PORT, DATABASE, MONGODB_URI, JWT };
