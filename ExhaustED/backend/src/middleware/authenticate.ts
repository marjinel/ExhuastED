import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      res.status(401).json({ success: false, message: 'Invalid authentication token.' });
      return;
    }

    const user = await User.findById(decoded.userId).select('_id email');

    if (!user) {
      res.status(401).json({ success: false, message: 'Token is invalid or user no longer exists.' });
      return;
    }

    req.userId = user._id.toString();
    req.userEmail = user.email;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};
