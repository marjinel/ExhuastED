import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityComment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  mood?: string;
  comments: ICommunityComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [3000, 'Post cannot exceed 3000 characters'],
    },
    mood: {
      type: String,
      trim: true,
      default: '',
      maxlength: [60, 'Mood cannot exceed 60 characters'],
    },
    comments: [CommunityCommentSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const cleanRet = ret as Record<string, unknown>;
        delete cleanRet.userId;
        if (Array.isArray(ret.comments)) {
          cleanRet.comments = ret.comments.map((comment: ICommunityComment) => {
            const cleanComment = { ...comment } as Record<string, unknown>;
            delete cleanComment.userId;
            return cleanComment;
          });
        }
        return ret;
      },
    },
  }
);

CommunityPostSchema.index({ createdAt: -1 });

export const CommunityPost =
  mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
