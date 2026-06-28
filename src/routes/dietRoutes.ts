import { Router } from 'express';
import { createDietTemplate, assignDiet, getMemberDiets } from '../controllers/dietController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Diet Plans
router.post('/template', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), createDietTemplate);
router.post('/assign', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), assignDiet);
router.get('/member/:memberId', authenticateToken, getMemberDiets);

export default router;
