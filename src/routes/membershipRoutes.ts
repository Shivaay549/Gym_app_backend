import { Router } from 'express';
import { createPlan, getGymPlans, assignMembership, recordPayment } from '../controllers/membershipController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Plans
router.post('/plans', authenticateToken, authorizeGymRole(['GYM_ADMIN']), createPlan);
router.get('/plans/gym/:gymId', authenticateToken, getGymPlans);

// Memberships
router.post('/assign', authenticateToken, authorizeGymRole(['GYM_ADMIN']), assignMembership);

// Payments
router.post('/payment', authenticateToken, authorizeGymRole(['GYM_ADMIN']), recordPayment);

export default router;
