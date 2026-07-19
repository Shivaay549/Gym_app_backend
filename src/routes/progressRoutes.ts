import { Router } from 'express';
import { analyzeProgressPhoto } from '../controllers/aiController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/analyze', authenticateToken, analyzeProgressPhoto);

export default router;
