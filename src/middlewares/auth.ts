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
    let user;
    
    // First, try decoding as custom JWT (for phone login)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      if (decoded && decoded.id) {
        user = { id: decoded.id };
      }
    } catch (e) {
      // Not a valid custom JWT, fallback to Supabase
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      } else if (error) {
        res.status(403).json({ message: 'Invalid or expired token', error: error.message });
        return;
      }
    }

    if (!user) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }

    req.user = user;
    
    // Optional: Fetch user roles across gyms
    const roles = await prisma.userGymRole.findMany({
      where: { userId: user.id }
    });
    
    req.userRoles = roles;

    // Enforce active membership for purely MEMBER roles
    if (roles.length > 0 && roles.every(r => r.role === 'MEMBER')) {
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId: user.id,
          status: { in: ['ACTIVE', 'GRACE_PERIOD'] }
        }
      });

      if (!activeMembership) {
        res.status(401).json({ message: 'Membership expired or not active. Please renew your plan.' });
        return;
      }
    }

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
