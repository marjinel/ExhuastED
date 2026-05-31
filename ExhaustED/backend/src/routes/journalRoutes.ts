import { Router } from 'express';
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from '../controllers/journalController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.post('/', createJournalEntry);
router.get('/', getJournalEntries);
router.put('/:id', updateJournalEntry);
router.delete('/:id', deleteJournalEntry);

export default router;
