import { Router } from 'express';
import { getAllGyms, createGym, getGymById } from '../controllers/gymController';
import { authenticateToken, authorizeRole, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Super Admin only
router.get('/', authenticateToken, authorizeRole(['SUPER_ADMIN']), getAllGyms);
router.post('/', authenticateToken, authorizeRole(['SUPER_ADMIN']), createGym);

// Accessible by Gym Admin or above
router.get('/:id', authenticateToken, authorizeGymRole(['GYM_ADMIN']), getGymById);

export default router;
