import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { CommunityPost } from '../models/CommunityPost';
import { validateSupportiveContent } from '../utils/moderation';

const postSchema = z.object({
  content: z.string().trim().min(1, 'Post content is required.').max(3000),
  mood: z.string().trim().max(60).optional(),
});

const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment content is required.').max(1000),
});

function requireUserId(req: AuthRequest): string {
  if (!req.userId) throw new AppError('Authentication is required.', 401);
  return req.userId;
}

export const createCommunityPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const validated = postSchema.parse(req.body);
    validateSupportiveContent(validated.content);

    const post = await CommunityPost.create({
      userId,
      content: validated.content,
      mood: validated.mood || '',
      comments: [],
    });

    res.status(201).json({
      success: true,
      message: 'Anonymous post created.',
      data: { post },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Community post validation failed.',
        errors: error.errors.map((item) => ({ field: item.path.join('.'), message: item.message })),
      });
      return;
    }
    if (error instanceof Error && error.message.includes('supportive')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getCommunityPosts = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: { posts } });
  } catch (error) {
    next(error);
  }
};

export const addCommunityComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const validated = commentSchema.parse(req.body);
    validateSupportiveContent(validated.content);

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId, content: validated.content } } },
      { new: true, runValidators: true }
    );

    if (!post) throw new AppError('Community post not found.', 404);

    res.json({
      success: true,
      message: 'Anonymous comment added.',
      data: { post },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Community comment validation failed.',
        errors: error.errors.map((item) => ({ field: item.path.join('.'), message: item.message })),
      });
      return;
    }
    if (error instanceof Error && error.message.includes('supportive')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
