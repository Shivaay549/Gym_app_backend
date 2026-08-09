import { Router } from 'express';
import { loginWithPhone, registerAdmin } from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middlewares/auth';

const router = Router();

router.post('/login/phone', loginWithPhone);

// Only Super Admins can register a new Gym Admin (Platform Owner flow)
router.post('/register-admin', authenticateToken, authorizeRole(['SUPER_ADMIN']), registerAdmin);

export default router;
