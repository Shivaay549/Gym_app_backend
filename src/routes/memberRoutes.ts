import { Router } from 'express';
import { createMember, getGymMembers, getMemberDetails } from '../controllers/memberController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Gym Admin can create and list members for their gym
router.post('/', authenticateToken, authorizeGymRole(['GYM_ADMIN']), createMember);
router.get('/gym/:gymId', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), getGymMembers);
router.get('/:id', authenticateToken, getMemberDetails); // Member themselves or Gym Admin can view

export default router;
