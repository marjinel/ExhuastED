import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

export default router;
