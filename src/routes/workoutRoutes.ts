import { Router } from 'express';
import { createWorkoutTemplate, assignWorkout, getMemberWorkouts, getAllExercises, createExercise, getGlobalWorkoutTemplates, upsertGlobalWorkoutTemplate } from '../controllers/workoutController';
import { authenticateToken, authorizeGymRole, authorizeRole } from '../middlewares/auth';

const router = Router();

// Exercise Library
router.get('/exercises', authenticateToken, getAllExercises);
router.post('/exercises', authenticateToken, authorizeRole(['GYM_ADMIN', 'TRAINER', 'SUPER_ADMIN']), createExercise);

// Workout Plans
router.post('/template', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), createWorkoutTemplate);
router.get('/template/:gymId', authenticateToken, getGlobalWorkoutTemplates);
router.put('/template', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), upsertGlobalWorkoutTemplate);
router.post('/assign', authenticateToken, authorizeGymRole(['GYM_ADMIN', 'TRAINER']), assignWorkout);
router.get('/member/:memberId', authenticateToken, getMemberWorkouts);


export default router;
