import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user?: any;
  userRoles?: any[];
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token missing' });
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(403).json({ message: 'Invalid or expired token', error: error?.message });
      return;
    }

    req.user = user;
    
    // Optional: Fetch user roles across gyms
    const roles = await prisma.userGymRole.findMany({
      where: { userId: user.id }
    });
    
    req.userRoles = roles;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const authorizeRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRoles) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const hasRole = req.userRoles.some(role => requiredRoles.includes(role.role));
    
    if (!hasRole) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const authorizeGymRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const gymId = req.params.gymId || req.body.gymId || req.query.gymId;

    if (!gymId) {
      res.status(400).json({ message: 'Gym ID is required for this action' });
      return;
    }

    if (!req.user || !req.userRoles) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Super Admins have access everywhere
    const isSuperAdmin = req.userRoles.some(r => r.role === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      next();
      return;
    }

    // Check specific gym role
    const gymRole = req.userRoles.find(r => r.gymId === gymId);
    
    if (!gymRole || !requiredRoles.includes(gymRole.role)) {
      res.status(403).json({ message: 'Insufficient permissions for this gym' });
      return;
    }

    next();
  };
};
