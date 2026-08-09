import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';

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

export const loginWithPhone = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;
  
  if (!phone) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  try {
    const profile = await prisma.profile.findFirst({
      where: { phone },
      include: { gymRoles: true }
    });

    if (!profile) {
      res.status(404).json({ error: 'User not found with this phone number' });
      return;
    }

    // Check for active membership if user is a MEMBER
    const isMemberOnly = profile.gymRoles.every(r => r.role === 'MEMBER');
    if (isMemberOnly) {
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId: profile.id,
          status: { in: ['ACTIVE', 'GRACE_PERIOD'] }
        }
      });

      if (!activeMembership) {
        res.status(403).json({ error: 'No active membership plan found. Please contact the admin to renew your plan.' });
        return;
      }
    }

    // Generate custom JWT
    const token = jwt.sign(
      { id: profile.id, method: 'phone' }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during phone login' });
  }
};
