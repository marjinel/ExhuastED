import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  detectedMood?: string | null;
  suggestAssessment?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      default: 'default',
      trim: true,
      maxlength: 120,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    detectedMood: {
      type: String,
      default: null,
      index: true,
    },
    suggestAssessment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
