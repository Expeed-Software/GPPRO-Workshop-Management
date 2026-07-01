import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload, UserRole } from '../types/User';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendError(res, 401, 'TOKEN_EXPIRED', 'Session expired. Please sign in again.');
    } else {
      sendError(res, 401, 'INVALID_TOKEN', 'Invalid authentication token.');
    }
  }
}
