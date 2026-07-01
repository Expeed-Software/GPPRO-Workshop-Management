import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/User';
import { sendError } from '../utils/response';

/**
 * RBAC middleware — restricts route to given allowed roles.
 * Role precedence: Administrator > Supervisor > Standard User
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      return;
    }

    const userRoles: UserRole[] = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      sendError(res, 403, 'FORBIDDEN', 'You do not have permission to perform this action.');
      return;
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRoles('Administrator')(req, res, next);
}

export function requireSupervisorOrAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRoles('Supervisor', 'Administrator')(req, res, next);
}
