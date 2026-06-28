import { Router } from 'express';
import { createTrainer, getGymTrainers, assignTrainerToMember } from '../controllers/trainerController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

router.post('/', authenticateToken, authorizeGymRole(['GYM_ADMIN']), createTrainer);
router.get('/gym/:gymId', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'MEMBER']), getGymTrainers);
router.post('/assign', authenticateToken, authorizeGymRole(['GYM_ADMIN']), assignTrainerToMember);

export default router;
