import { Router } from 'express';
import { getProfile, updateNotifications, updatePrivacy, updateProfile, updateWellness } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/notifications', updateNotifications);
router.put('/privacy', updatePrivacy);
router.put('/wellness', updateWellness);

export default router;
