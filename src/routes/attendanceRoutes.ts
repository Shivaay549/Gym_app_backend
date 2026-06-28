import { Router } from 'express';
import { markAttendance, markCheckOut, getGymAttendance } from '../controllers/attendanceController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

router.post('/mark', authenticateToken, authorizeGymRole(['GYM_ADMIN']), markAttendance);
router.put('/checkout/:id', authenticateToken, authorizeGymRole(['GYM_ADMIN']), markCheckOut);
router.get('/gym/:gymId', authenticateToken, authorizeGymRole(['GYM_ADMIN']), getGymAttendance);

export default router;
