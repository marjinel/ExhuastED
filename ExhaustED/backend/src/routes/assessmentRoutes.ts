import { Router } from 'express';
import {
  createAssessment,
  getAssessmentById,
  getAssessmentHistory,
  getLatestAssessment,
} from '../controllers/assessmentController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.post('/create', createAssessment);
router.get('/history', getAssessmentHistory);
router.get('/latest', getLatestAssessment);
router.get('/:id', getAssessmentById);

export default router;
