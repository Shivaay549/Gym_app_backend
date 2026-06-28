import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// --- Membership Plans ---

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  const { gymId, name, durationDays, price, planType } = req.body;
  try {
    const plan = await prisma.membershipPlan.create({
      data: { gymId, name, durationDays, price, planType }
    });
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGymPlans = async (req: Request, res: Response): Promise<void> => {
  const { gymId } = req.params;
  try {
    const plans = await prisma.membershipPlan.findMany({ where: { gymId } });
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- Memberships (User Subscriptions) ---

export const assignMembership = async (req: Request, res: Response): Promise<void> => {
  const { userId, gymId, planId, startDate } = req.body;

  try {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    const membership = await prisma.membership.create({
      data: {
        userId,
        gymId,
        planId,
        startDate: start,
        endDate: end,
        status: 'ACTIVE'
      }
    });

    res.status(201).json(membership);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- Payments ---

export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  const { gymId, userId, amount, paymentType } = req.body;

  try {
    const payment = await prisma.payment.create({
      data: {
        gymId,
        userId,
        amount,
        paymentType,
        status: 'COMPLETED'
      }
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
