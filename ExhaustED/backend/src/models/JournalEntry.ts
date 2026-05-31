import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  mood?: string;
  entryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [140, 'Journal title cannot exceed 140 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [10000, 'Journal entry cannot exceed 10000 characters'],
    },
    mood: {
      type: String,
      trim: true,
      default: '',
      maxlength: [40, 'Mood cannot exceed 40 characters'],
    },
    entryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

JournalEntrySchema.index({ userId: 1, entryDate: -1 });

export const JournalEntry =
  mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
