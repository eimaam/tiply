import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { MONGODB_URI, NodeEnv } from './env.config';


// Connection options
const options = {
  autoIndex: true,
  connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
  socketTimeoutMS: 45000,  // Close sockets after 45 seconds of inactivity
  family: 4                // Use IPv4, skip trying IPv6
};

// Create a connection function
export const connectDB = async (): Promise<void> => {
  try {
    logger.info('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string, options);
    
    logger.info(`✅ MongoDB connected successfully! [${NodeEnv}]`);
    
    // Get the default connection
    const db = mongoose.connection;
    
    // Connection events
    db.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err}`);
    });
    
    db.on('disconnected', () => {
      logger.warn('🔌 MongoDB disconnected. Attempting to reconnect...');
    });
    
    db.on('reconnected', () => {
      logger.info('🔁 MongoDB reconnected!');
    });
    
    // Handle Node.js process termination and close MongoDB connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('👋 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return;
  } catch (error: any) {
    logger.error(`💥 MongoDB connection error: ${error.message}`);
    throw error;
  }
};

// Export a disconnect function for testing and graceful shutdowns
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error: any) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};



