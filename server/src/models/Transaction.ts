import mongoose, { Document, Schema } from 'mongoose';

/**
 * Transaction types enum
 */
export enum TransactionType {
  TIP = 'tip',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  REFUND = 'refund',
  FEE = 'fee',
}

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Interface for Transaction document
 */
export interface ITransaction extends Document {
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  txHash?: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  txSignature: string;
  message?: string;
  recipient: Schema.Types.ObjectId;
  tipperWallet?: string;
  fee: number;
  netAmount: number;
  blockExplorerUrl: string;
}

/**
 * Schema for Transaction model
 */
const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USDC',
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.PENDING,
      index: true,
    },
    
    txHash: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    
    txSignature: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tipperWallet: {
      type: String,
      trim: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    blockExplorerUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ recipient: 1, createdAt: -1 });

// Export the Transaction model
export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);