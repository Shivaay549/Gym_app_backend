import { Router } from 'express';
import gymRoutes from './gymRoutes';
import memberRoutes from './memberRoutes';
import trainerRoutes from './trainerRoutes';
import membershipRoutes from './membershipRoutes';
import attendanceRoutes from './attendanceRoutes';
import workoutRoutes from './workoutRoutes';
import dietRoutes from './dietRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/gyms', gymRoutes);
router.use('/members', memberRoutes);
router.use('/trainers', trainerRoutes);
router.use('/memberships', membershipRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/workouts', workoutRoutes);
router.use('/diets', dietRoutes);

// Health check route to prevent Render spin-down
router.get('/ping', (req, res) => {
  res.json({ status: 'active', timestamp: new Date() });
});

export default router;
