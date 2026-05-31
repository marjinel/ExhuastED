import { Router } from 'express';
import { clearChatHistory, getChatHistory, sendMessage } from '../controllers/chatbotController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
