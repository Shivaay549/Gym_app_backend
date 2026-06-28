import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const createDietTemplate = async (req: Request, res: Response): Promise<void> => {
  const { gymId, name, goal, meals } = req.body;
  // meals: [{ mealTime, foodItems }]

  try {
    const plan = await prisma.dietPlan.create({
      data: {
        gymId,
        name,
        goal,
        meals: {
          create: meals
        }
      },
      include: { meals: true }
    });

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignDiet = async (req: Request, res: Response): Promise<void> => {
  const { gymId, trainerId, memberId, name, goal, meals } = req.body;

  try {
    const plan = await prisma.dietPlan.create({
      data: {
        gymId,
        trainerId,
        memberId,
        name,
        goal,
        meals: {
          create: meals
        }
      },
      include: { meals: true }
    });

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberDiets = async (req: Request, res: Response): Promise<void> => {
  const { memberId } = req.params;

  try {
    const plans = await prisma.dietPlan.findMany({
      where: { memberId },
      include: {
        meals: true
      }
    });

    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
