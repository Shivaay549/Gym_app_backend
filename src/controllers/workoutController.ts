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

export const createExercise = async (req: Request, res: Response): Promise<void> => {
  const { name, muscleGroup, videoUrl, instructions, difficulty } = req.body;
  try {
    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        videoUrl,
        instructions,
        difficulty
      }
    });
    res.status(201).json(exercise);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGlobalWorkoutTemplates = async (req: Request, res: Response): Promise<void> => {
  const { gymId } = req.params;
  
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { 
        gymId,
        memberId: null
      },
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

export const upsertGlobalWorkoutTemplate = async (req: Request, res: Response): Promise<void> => {
  const { gymId, name, goal, exercises } = req.body;

  try {
    let plan = await prisma.workoutPlan.findFirst({
      where: {
        gymId,
        memberId: null,
        goal
      }
    });

    if (plan) {
      // Delete existing exercises to replace them
      await prisma.workoutExercise.deleteMany({
        where: { planId: plan.id }
      });
      
      plan = await prisma.workoutPlan.update({
        where: { id: plan.id },
        data: {
          name,
          exercises: {
            create: exercises
          }
        },
        include: { exercises: { include: { exercise: true } } }
      });
    } else {
      plan = await prisma.workoutPlan.create({
        data: {
          gymId,
          name,
          goal,
          exercises: {
            create: exercises
          }
        },
        include: { exercises: { include: { exercise: true } } }
      });
    }

    res.status(200).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

