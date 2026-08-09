import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { supabase } from '../config/supabase';

export const createMember = async (req: Request, res: Response): Promise<void> => {
  const { gymId, email, password, fullName, phone, gender, dob, address, emergencyContact } = req.body;

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

    // 2. Create Profile & Role in transaction
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          id: userId,
          fullName,
          phone,
          gender,
          dob: dob ? new Date(dob) : null,
          address,
          emergencyContact
        }
      });

      await tx.userGymRole.create({
        data: {
          userId: userId,
          gymId: gymId,
          role: 'MEMBER'
        }
      });

      return profile;
    });

    res.status(201).json({
      message: 'Member registered successfully',
      user: result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getGymMembers = async (req: Request, res: Response): Promise<void> => {
  const { gymId } = req.params;

  try {
    const roles = await prisma.userGymRole.findMany({
      where: { gymId, role: { in: ['MEMBER', 'GYM_ADMIN'] } },
      include: {
        user: {
          include: {
            memberships: {
              where: { gymId },
              include: { plan: true }
            }
          }
        }
      }
    });

    const members = roles.map(r => r.user);
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getMemberDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { plan: true }
        },
        progressLogs: true,
        achievements: true,
        attendance: true,
        payments: true,
        assignedToTrainer: {
          include: { trainer: { include: { user: true } } }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { profilePhotoBase64 } = req.body; // e.g. "data:image/jpeg;base64,/9j/4AAQSk..."

  if (!profilePhotoBase64) {
    res.status(400).json({ error: 'Profile photo base64 string is required' });
    return;
  }

  try {
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: { profilePhotoUrl: profilePhotoBase64 }
    });

    res.json({ message: 'Profile photo updated successfully', profile: updatedProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
