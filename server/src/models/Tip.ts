import mongoose, { Document, Schema } from 'mongoose';

export interface ITip extends Document {
  recipientId: mongoose.Types.ObjectId;
  amount: number;
  message?: string;
  transactionSignature: string;
  tipperWallet?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema<ITip>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    transactionSignature: {
      type: String,
      required: true,
      unique: true,
    },
    tipperWallet: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
TipSchema.index({ recipientId: 1 });
TipSchema.index({ transactionSignature: 1 }, { unique: true });
TipSchema.index({ status: 1 });
TipSchema.index({ createdAt: -1 });

export const TipModel = mongoose.models.Tip || mongoose.model<ITip>('Tip', TipSchema);
