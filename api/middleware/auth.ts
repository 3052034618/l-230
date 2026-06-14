import type { Request, Response, NextFunction } from 'express';
import { MOCK_USERS } from '../data/mockData.js';
import type { User } from '../../src/types';

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);
  const match = token.match(/^mock-token-(.+)$/);
  
  if (!match) {
    req.user = null;
    return next();
  }

  const userId = match[1];
  const user = MOCK_USERS.find((u) => u.id === userId);
  
  req.user = user || null;
  next();
}
