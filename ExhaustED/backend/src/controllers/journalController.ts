import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { JournalEntry } from '../models/JournalEntry';

const journalSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(140),
  content: z.string().trim().min(1, 'Content is required.').max(10000),
  mood: z.string().trim().max(40).optional(),
  entryDate: z.string().datetime().optional(),
});

function requireUserId(req: AuthRequest): string {
  if (!req.userId) throw new AppError('Authentication is required.', 401);
  return req.userId;
}

export const createJournalEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const validated = journalSchema.parse(req.body);
    const entry = await JournalEntry.create({
      userId,
      title: validated.title,
      content: validated.content,
      mood: validated.mood || '',
      entryDate: validated.entryDate ? new Date(validated.entryDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry saved.',
      data: { entry },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Journal validation failed.',
        errors: error.errors.map((item) => ({ field: item.path.join('.'), message: item.message })),
      });
      return;
    }
    next(error);
  }
};

export const getJournalEntries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const entries = await JournalEntry.find({ userId }).sort({ entryDate: -1, createdAt: -1 }).limit(limit);

    res.json({
      success: true,
      data: { entries },
    });
  } catch (error) {
    next(error);
  }
};

export const updateJournalEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const validated = journalSchema.partial().parse(req.body);
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        ...validated,
        ...(validated.entryDate ? { entryDate: new Date(validated.entryDate) } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!entry) throw new AppError('Journal entry not found.', 404);

    res.json({
      success: true,
      message: 'Journal entry updated.',
      data: { entry },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Journal validation failed.',
        errors: error.errors.map((item) => ({ field: item.path.join('.'), message: item.message })),
      });
      return;
    }
    next(error);
  }
};

export const deleteJournalEntry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId });

    if (!entry) throw new AppError('Journal entry not found.', 404);

    res.json({
      success: true,
      message: 'Journal entry deleted.',
    });
  } catch (error) {
    next(error);
  }
};
