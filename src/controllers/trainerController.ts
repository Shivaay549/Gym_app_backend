import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { supabase } from '../config/supabase';

export const createTrainer = async (req: Request, res: Response): Promise<void> => {
  const { gymId, email, password, fullName, phone, specialization, experienceYears } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      res.status(400).json({ error: authError?.message || 'Failed to create trainer auth' });
      return;
    }

    const userId = authData.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          id: userId,
          fullName,
          phone,
        }
      });

      await tx.userGymRole.create({
        data: {
          userId: userId,
          gymId: gymId,
          role: 'TRAINER'
        }
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: userId,
          gymId: gymId,
          specialization,
          experienceYears
        }
      });

      return { profile, trainer };
    });

    res.status(201).json({
      message: 'Trainer added successfully',
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getGymTrainers = async (req: Request, res: Response): Promise<void> => {
  const { gymId } = req.params;

  try {
    const trainers = await prisma.trainer.findMany({
      where: { gymId },
      include: {
        user: true,
        assignedMembers: {
          include: { member: true }
        }
      }
    });

    res.json(trainers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const assignTrainerToMember = async (req: Request, res: Response): Promise<void> => {
  const { gymId, memberId, trainerId, startDate, endDate, notes } = req.body;

  try {
    const assignment = await prisma.memberTrainer.create({
      data: {
        memberId,
        trainerId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes
      }
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
