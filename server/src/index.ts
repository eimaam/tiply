import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middleware/rate-limit.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import permissionsRoutes from './routes/permissions.routes';
import transactionRoutes from './routes/transaction.routes';
import waitlistRoutes from './routes/waitlist.routes';
import analyticsRoutes from './routes/analytics.routes';
import tipRoutes from './routes/tip.routes';
import { connectDB } from './config/database';


// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// for rate-limiting behind proxies (deployed api in vercel) 
app.set('trust proxy', 1);

// Configure CORS to allow credentials
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://usetiply.xyz',
      'https://www.usetiply.xyz'
    ];
    
    // Allow requests with no origin (like mobile apps, curl requests, etc)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS 🔒'));
    }
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies for authentication

// Apply global rate limiter to all requests
app.use(globalRateLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/permissions', permissionsRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/tips', tipRoutes);

// Health check route
app.use('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running 🚀',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Base route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the tiply v1 API ✨',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error 😓',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 middleware for unhandled routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found 🔍',
    path: req.originalUrl,
  });
});

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server and exit process
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;