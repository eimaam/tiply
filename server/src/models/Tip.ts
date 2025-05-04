import mongoose, { Schema, model, Document } from 'mongoose';

// Interface for Tip document
export interface ITip extends Document {
    recipientAddress: string; // Solana wallet address of recipient
    amount: number;
    currency: 'USDC';
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    message?: string; // Optional message from tipper
    createdAt: Date;
}

// Define the schema
const tipSchema = new Schema<ITip>({
    recipientAddress: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        enum: ['USDC'],
        default: 'USDC',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        required: true,
    },
    transactionId: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

export const TipModel = mongoose.models.TipModel || model<ITip>('Tip', tipSchema);
