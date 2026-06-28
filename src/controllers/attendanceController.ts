import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  const { gymId, userId } = req.body;
  
  try {
    // Basic date truncation to YYYY-MM-DD for uniqueness check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.create({
      data: {
        gymId,
        userId,
        date: today,
        timeIn: new Date(),
      }
    });

    res.status(201).json(attendance);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Attendance already marked for today' });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};

export const markCheckOut = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const attendance = await prisma.attendance.update({
      where: { id },
      data: { timeOut: new Date() }
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGymAttendance = async (req: Request, res: Response): Promise<void> => {
  const { gymId } = req.params;
  const { date } = req.query;

  try {
    let whereClause: any = { gymId };
    
    if (date) {
      const targetDate = new Date(date as string);
      targetDate.setHours(0, 0, 0, 0);
      whereClause.date = targetDate;
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { fullName: true, id: true } }
      },
      orderBy: { timeIn: 'desc' }
    });

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
