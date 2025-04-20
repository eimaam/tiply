import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ℹ️ ${message}`, ...args);
    },
    
    warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ⚠️ ${message}`, ...args);
    },
    
    error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] 🚨 ${message}`, ...args);
    },
    
    debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] 🔍 ${message}`, ...args);
    }
  }
};
