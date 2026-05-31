import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import checkinRoutes from './routes/checkinRoutes';
import chatRoutes from './routes/chatRoutes';
import journalRoutes from './routes/journalRoutes';
import communityRoutes from './routes/communityRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
  credentials: true,
}));

// Logging & parsing
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 MBalance API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
