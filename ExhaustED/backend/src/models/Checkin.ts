import mongoose, { Document, Schema } from 'mongoose';

// ─── Daily Check-in ────────────────────────────────────────────────────────────

export interface IDailyCheckin extends Document {
  userId: mongoose.Types.ObjectId;
  mood: string;
  sleepHours: number;
  stressLevel: number;
  motivationLevel: number;
  wellnessScore: number;
  dailyInsight: string;
  date: Date;
  createdAt: Date;
}

const DailyCheckinSchema = new Schema<IDailyCheckin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: { type: String, required: true },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    motivationLevel: { type: Number, required: true, min: 1, max: 10 },
    wellnessScore: { type: Number, required: true, min: 0, max: 100 },
    dailyInsight: { type: String, required: true },
    date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0) },
  },
  { timestamps: true }
);

// Ensure one check-in per user per day
DailyCheckinSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyCheckin = mongoose.model<IDailyCheckin>('DailyCheckin', DailyCheckinSchema);

// ─── Chat Message ───────────────────────────────────────────────────────────────

export interface IChatMessage extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  detectedMood?: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    detectedMood: { type: String, default: null },
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);