import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { usersRepository } from '../repositories/users.repository';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../utils/errors';

export class AuthController {
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        sendError(res, 400, 'VALIDATION_ERROR', 'identifier and password are required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      const result = await authService.signIn(identifier, password, ip);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendError(res, 400, 'INVALID_TOKEN', 'refreshToken is required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      await authService.signOut(refreshToken, req.user!.userId, ip);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async passwordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, 400, 'VALIDATION_ERROR', 'email is required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      await authService.initiatePasswordReset(email, ip);
      sendSuccess(res, { message: 'If that email is registered, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  }

  async passwordResetConfirm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        sendError(res, 400, 'VALIDATION_ERROR', 'token and newPassword are required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      await authService.confirmPasswordReset(token, newPassword, ip);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        sendError(res, 400, 'VALIDATION_ERROR', 'oldPassword and newPassword are required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      await authService.changePassword(req.user!.userId, oldPassword, newPassword, ip);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async lockAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId) {
        sendError(res, 400, 'VALIDATION_ERROR', 'userId is required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      await authService.lockAccount(req.user!.userId, Number(userId), ip);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async unlockAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId) {
        sendError(res, 400, 'VALIDATION_ERROR', 'userId is required.');
        return;
      }
      const ip = req.ip || req.socket.remoteAddress;
      await authService.unlockAccount(req.user!.userId, Number(userId), ip);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async mfaSend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, method } = req.body;
      if (!userId || !method) {
        sendError(res, 400, 'VALIDATION_ERROR', 'userId and method are required.');
        return;
      }
      await authService.sendMfaCode(Number(userId), method);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async mfaVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, code } = req.body;
      if (!userId || !code) {
        sendError(res, 400, 'VALIDATION_ERROR', 'userId and code are required.');
        return;
      }
      await authService.verifyMfaCode(Number(userId), code);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async getUserLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, fromDate, toDate, type, page, limit } = req.query;
      const result = await usersRepository.getUserLogs({
        userId: userId ? Number(userId) : undefined,
        fromDate: fromDate as string,
        toDate: toDate as string,
        type: type as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });
      sendSuccess(res, result.data, 200, { total: result.total, page: Number(page || 1) });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
