import { Router } from 'express';
import { getAllGyms, createGym, getGymById, getGymAchievements, getGymTrainers } from '../controllers/gymController';
import { authenticateToken, authorizeRole, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Super Admin only
router.get('/', authenticateToken, authorizeRole(['SUPER_ADMIN']), getAllGyms);
router.post('/', authenticateToken, authorizeRole(['SUPER_ADMIN']), createGym);

// Accessible by Gym Admin or above
router.get('/:id', authenticateToken, authorizeGymRole(['GYM_ADMIN']), getGymById);

// Accessible by any logged in member of the gym
router.get('/:gymId/achievements', authenticateToken, getGymAchievements);
router.get('/:gymId/trainers', authenticateToken, getGymTrainers);

export default router;
