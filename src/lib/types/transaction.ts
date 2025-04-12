/**
 * Transaction-related types and enums 
 */

/**
 * Enum for transaction types
 */
export enum TransactionType {
  TIP = 'tip',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  FEE = 'fee',
  REFUND = 'refund'
}

/**
 * Enum for transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing'
}

/**
 * Enum for currency types
 */
export enum CurrencyType {
  USDC = 'usdc',
  SOL = 'sol',
}

/**
 * Interface for transaction data
 */
export interface Transaction {
  id: string;
  userId: string;
  senderAddress?: string;
  recipientAddress: string;
  amount: number;
  currency: CurrencyType;
  type: TransactionType;
  status: TransactionStatus;
  fee?: number;
  message?: string;
  tipLink?: string;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for tip transaction specific data
 */
export interface TipTransaction extends Transaction {
  type: TransactionType.TIP;
  senderName?: string;
  isAnonymous: boolean;
}

/**
 * Interface for transaction statistics
 */
export interface TransactionStats {
  totalReceived: number;
  totalSent: number;
  totalFees: number;
  tipCount: number;
  avgTipAmount: number;
  largestTip: number;
  currency: CurrencyType;
}

/**
 * Interface for transaction filters
 */
export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Interface for payment method
 */
export interface PaymentMethod {
  id: string;
  type: 'wallet';
  walletType: 'phantom' | 'solflare' | 'backpack' | 'other';
  address: string;
  isDefault: boolean;
  label?: string;
}