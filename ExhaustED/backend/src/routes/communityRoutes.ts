import { Router } from 'express';
import { addCommunityComment, createCommunityPost, getCommunityPosts } from '../controllers/communityController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.post('/', createCommunityPost);
router.get('/', getCommunityPosts);
router.post('/:id/comments', addCommunityComment);

export default router;
