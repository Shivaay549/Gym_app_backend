import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getAllGyms = async (req: Request, res: Response): Promise<void> => {
  try {
    const gyms = await prisma.gym.findMany({
      include: {
        _count: {
          select: { memberships: true, trainers: true }
        }
      }
    });
    res.json(gyms);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createGym = async (req: Request, res: Response): Promise<void> => {
  const { name, address, contactNumber } = req.body;

  try {
    const gym = await prisma.gym.create({
      data: {
        name,
        address,
        contactNumber
      }
    });
    res.status(201).json(gym);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getGymById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const gym = await prisma.gym.findUnique({
      where: { id },
      include: {
        trainers: true,
        plans: true
      }
    });
    if (!gym) {
      res.status(404).json({ message: 'Gym not found' });
      return;
    }
    res.json(gym);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
