import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { User } from '../models/User';

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  gradeLevel: z.string().trim().max(80).optional(),
  age: z.number().int().min(1).max(120).nullable().optional(),
  school: z.string().trim().max(160).optional(),
  program: z.string().trim().min(1).max(120).optional(),
  profileImageUri: z.string().trim().max(1000).optional(),
});

const notificationsSchema = z.object({
  enabled: z.boolean().optional(),
  dailyCheckin: z.boolean().optional(),
  studyBreaks: z.boolean().optional(),
  hydration: z.boolean().optional(),
  sleep: z.boolean().optional(),
});

const privacySchema = z.object({
  anonymousCommunity: z.boolean().optional(),
  saveChatHistory: z.boolean().optional(),
  localOnlyMode: z.boolean().optional(),
});

const wellnessSchema = z.object({
  remindersEnabled: z.boolean().optional(),
  reminderTime: z.string().trim().max(10).optional(),
  language: z.literal('English').optional(),
});

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.userId, validated, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new AppError('User not found.', 404);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Profile validation failed.',
        errors: error.errors.map((item) => ({ field: item.path.join('.'), message: item.message })),
      });
      return;
    }
    next(error);
  }
};

export const updateNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = notificationsSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: Object.fromEntries(Object.entries(validated).map(([key, value]) => [`notificationPreferences.${key}`, value])) },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, message: 'Notification preferences updated.', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updatePrivacy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = privacySchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: Object.fromEntries(Object.entries(validated).map(([key, value]) => [`privacyPreferences.${key}`, value])) },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, message: 'Privacy preferences updated.', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateWellness = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = wellnessSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: Object.fromEntries(Object.entries(validated).map(([key, value]) => [`wellnessPreferences.${key}`, value])) },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, message: 'Wellness preferences updated.', data: { user } });
  } catch (error) {
    next(error);
  }
};
