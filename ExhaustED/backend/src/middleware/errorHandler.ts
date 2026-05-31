import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as Error & { code?: number }).code === 11000) {
    const field = err.message.match(/index: (\w+)_/)?.[1] || 'field';
    res.status(400).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Something went wrong. Please try again.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
