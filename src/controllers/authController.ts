import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    // Get user profile and roles
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
      include: { gymRoles: true }
    });

    res.json({
      message: 'Login successful',
      token: data.session.access_token,
      user: profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, phone, gymName } = req.body;

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      res.status(400).json({ error: authError?.message || 'Failed to create user' });
      return;
    }

    const userId = authData.user.id;

    // 2. Create Gym & Profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          id: userId,
          fullName,
          phone,
        }
      });

      const gym = await tx.gym.create({
        data: {
          name: gymName,
        }
      });

      await tx.userGymRole.create({
        data: {
          userId: userId,
          gymId: gym.id,
          role: 'GYM_ADMIN'
        }
      });

      return { profile, gym };
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
