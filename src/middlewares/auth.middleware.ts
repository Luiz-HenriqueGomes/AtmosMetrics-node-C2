import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { prisma } from '../utils/prisma.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: User not found' });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
