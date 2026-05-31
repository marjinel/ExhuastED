import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (userId: mongoose.Types.ObjectId, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign(
    { userId: userId.toString(), email } as TokenPayload,
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  return jwt.verify(token, secret) as TokenPayload;
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};