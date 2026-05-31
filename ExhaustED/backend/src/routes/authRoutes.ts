import { Router } from 'express';
import { register, login, getMe, changePassword, deleteAccount } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/password', authenticate, changePassword);
router.delete('/', authenticate, deleteAccount);

export default router;
