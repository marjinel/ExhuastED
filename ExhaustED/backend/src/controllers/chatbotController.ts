import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { ChatMessage } from '../models/ChatMessage';
import { MajikChatbotService } from '../services/lumiChatbot';

const messageSchema = z.object({
  message: z.string().trim().min(1, 'Message is required.').max(2000, 'Message is too long.'),
  conversationId: z.string().trim().min(1).max(120).optional(),
});

function requireUserId(req: AuthRequest): string {
  if (!req.userId) {
    throw new AppError('Authentication is required.', 401);
  }
  return req.userId;
}

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const { message, conversationId = 'default' } = messageSchema.parse(req.body);

    const recentMessages = await ChatMessage.find({ userId, conversationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const context = recentMessages
      .reverse()
      .map((item) => ({ role: item.role, content: item.content, createdAt: item.createdAt }));
    const majik = MajikChatbotService.generateResponse(message, context);

    const [userMessage, assistantMessage] = await ChatMessage.create([
      {
        userId,
        conversationId,
        role: 'user',
        content: message,
        detectedMood: majik.detectedMood,
      },
      {
        userId,
        conversationId,
        role: 'assistant',
        content: majik.reply,
        detectedMood: majik.detectedMood,
        suggestAssessment: majik.suggestAssessment,
      },
    ]);

    res.status(201).json({
      success: true,
      message: 'Majik response generated.',
      data: {
        userMessage,
        assistantMessage,
        detectedMood: majik.detectedMood,
        suggestAssessment: majik.suggestAssessment,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Message validation failed.',
        errors: error.errors.map((item) => ({ field: item.path.join('.'), message: item.message })),
      });
      return;
    }
    next(error);
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const conversationId = typeof req.query.conversationId === 'string' ? req.query.conversationId : 'default';
    const limit = Math.min(Number(req.query.limit) || 100, 200);

    const messages = await ChatMessage.find({ userId, conversationId })
      .sort({ createdAt: 1 })
      .limit(limit);

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const conversationId = typeof req.query.conversationId === 'string' ? req.query.conversationId : 'default';

    await ChatMessage.deleteMany({ userId, conversationId });

    res.json({
      success: true,
      message: 'Chat history cleared for this account.',
    });
  } catch (error) {
    next(error);
  }
};
