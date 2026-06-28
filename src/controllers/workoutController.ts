import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const createWorkoutTemplate = async (req: Request, res: Response): Promise<void> => {
  const { gymId, name, goal, exercises } = req.body;
  // exercises: [{ exerciseId, sets, reps, dayOfWeek }]

  try {
    const plan = await prisma.workoutPlan.create({
      data: {
        gymId,
        name,
        goal,
        exercises: {
          create: exercises
        }
      },
      include: { exercises: true }
    });

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignWorkout = async (req: Request, res: Response): Promise<void> => {
  const { gymId, trainerId, memberId, name, goal, exercises } = req.body;

  try {
    const plan = await prisma.workoutPlan.create({
      data: {
        gymId,
        trainerId,
        memberId,
        name,
        goal,
        exercises: {
          create: exercises
        }
      },
      include: { exercises: true }
    });

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberWorkouts = async (req: Request, res: Response): Promise<void> => {
  const { memberId } = req.params;

  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { memberId },
      include: {
        exercises: {
          include: { exercise: true }
        }
      }
    });

    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Exercise Library
export const getAllExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const exercises = await prisma.exercise.findMany();
    res.json(exercises);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
