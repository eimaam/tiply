import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlist extends Document {
  email: string;
  createdAt: Date;
}

const WaitlistSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster lookups
WaitlistSchema.index({ email: 1 });

export default mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);