import { Router } from 'express';
import { createWorkoutTemplate, assignWorkout, getMemberWorkouts, getAllExercises } from '../controllers/workoutController';
import { authenticateToken, authorizeGymRole } from '../middlewares/auth';

const router = Router();

// Exercise Library
router.get('/exercises', authenticateToken, getAllExercises);

// Workout Plans
router.post('/template', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), createWorkoutTemplate);
router.post('/assign', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), assignWorkout);
router.get('/member/:memberId', authenticateToken, getMemberWorkouts);

export default router;
