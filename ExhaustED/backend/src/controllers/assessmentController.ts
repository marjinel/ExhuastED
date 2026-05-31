import { Response, NextFunction } from 'express';
import { Assessment } from '../models/Assessment';
import { BurnoutDetectionEngine } from '../services/burnoutEngine';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

export const createAssessment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sleep, academicWorkload, emotionalState, physicalHealth, social, productivity } = req.body;

    // Run burnout detection engine
    const results = BurnoutDetectionEngine.analyze({
      sleep,
      academicWorkload,
      emotionalState,
      physicalHealth,
      social,
      productivity,
    });

    const assessment = await Assessment.create({
      userId: req.userId,
      sleep,
      academicWorkload,
      emotionalState,
      physicalHealth,
      social,
      productivity,
      results,
    });

    res.status(201).json({
      success: true,
      message: 'Assessment completed successfully.',
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filter = 'all', page = 1, limit = 10 } = req.query;

    let dateFilter: Record<string, Date> = {};
    const now = new Date();

    if (filter === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: weekAgo };
    } else if (filter === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: monthAgo };
    }

    const query = {
      userId: req.userId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    const total = await Assessment.countDocuments(query);
    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('results.burnoutScore results.riskLevel createdAt');

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestAssessment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await Assessment.findOne({ userId: req.userId })
      .sort({ createdAt: -1 });

    if (!assessment) {
      res.json({ success: true, data: { assessment: null } });
      return;
    }

    res.json({ success: true, data: { assessment } });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!assessment) throw new AppError('Assessment not found.', 404);

    res.json({ success: true, data: { assessment } });
  } catch (error) {
    next(error);
  }
};