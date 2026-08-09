import { Router } from 'express';
import { createDietTemplate, assignDiet, getMemberDiets, getGlobalDietTemplates, upsertGlobalDietTemplate } from '../controllers/dietController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Diet Plans
router.post('/template', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), createDietTemplate);
router.post('/assign', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), assignDiet);
router.get('/member/:memberId', authenticateToken, getMemberDiets);

// Global Diet Templates
router.get('/template/:gymId', authenticateToken, getGlobalDietTemplates);
router.put('/template', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), upsertGlobalDietTemplate);

export default router;
