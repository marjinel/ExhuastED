import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  studentId: z.string().min(1),
  program: z.string().min(1),
  yearLevel: z.number().int().min(1).max(6),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: validated.email }, { studentId: validated.studentId }],
    });

    if (existingUser) {
      const field = existingUser.email === validated.email ? 'email' : 'student ID';
      throw new AppError(`An account with this ${field} already exists.`, 400);
    }

    const user = await User.create({
      fullName: validated.fullName,
      email: validated.email,
      studentId: validated.studentId,
      program: validated.program,
      yearLevel: validated.yearLevel,
      password: validated.password,
    });

    const token = generateToken(user._id, user.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to MBalance.',
      data: { token, user },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await user.comparePassword(validated.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken(user._id, user.email);
    const userObj = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful. Welcome back!',
      data: { token, user: userObj },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid credentials format.' });
      return;
    }
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    });

    const { currentPassword, newPassword } = schema.parse(req.body);
    const user = await User.findById(req.userId).select('+password');
    if (!user) throw new AppError('User not found.', 404);

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new AppError('Current password is incorrect.', 400);

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ success: true, message: 'Account deleted. We hope to see you again.' });
  } catch (error) {
    next(error);
  }
};