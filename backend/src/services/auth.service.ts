import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { usersRepository } from '../repositories/users.repository';
import { validatePassword } from '../utils/passwordPolicy';
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { AuthTokenPayload, User } from '../types/User';
import logger from '../utils/logger';

const SALT_ROUNDS = 12;
const MAX_FAILED_LOGINS = parseInt(process.env.MAX_FAILED_LOGINS || '5', 10);
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthService {
  async signIn(
    identifier: string,
    password: string,
    ip?: string
  ): Promise<{ token: string; refreshToken: string; user: Partial<User> }> {
    const user = await usersRepository.findByIdentifier(identifier);

    if (!user) {
      await usersRepository.writeUserLog({
        userId: 0,
        action: 'sign-in-failure',
        ip,
        status: 'failure',
        remarks: `Unknown identifier: ${identifier}`,
        timestamp: new Date(),
      });
      throw new AuthError('Incorrect username or password.', 'INVALID_CREDENTIALS');
    }

    if (user.status === 'locked') {
      throw new AuthError(
        'Account locked after multiple failed attempts.',
        'ACCOUNT_LOCKED'
      );
    }

    if (user.status === 'inactive') {
      throw new ForbiddenError('Account is inactive.');
    }

    // Legacy DB stores plain-text passwords
    const passwordValid = password === user.passwordHash;

    if (!passwordValid) {
      const newFailCount = (user.failedLoginAttempts || 0) + 1;
      await usersRepository.updateFailedLogins(user.id, newFailCount);

      if (newFailCount >= MAX_FAILED_LOGINS) {
        await usersRepository.lockUser(user.id);
        await usersRepository.writeUserLog({
          userId: user.id,
          action: 'account-locked',
          ip,
          status: 'failure',
          remarks: `Locked after ${newFailCount} failed login attempts`,
          timestamp: new Date(),
        });
        throw new AuthError(
          'Account locked after multiple failed attempts.',
          'ACCOUNT_LOCKED'
        );
      }

      await usersRepository.writeUserLog({
        userId: user.id,
        action: 'sign-in-failure',
        ip,
        status: 'failure',
        remarks: `Failed attempt ${newFailCount}/${MAX_FAILED_LOGINS}`,
        timestamp: new Date(),
      });

      throw new AuthError('Incorrect username or password.', 'INVALID_CREDENTIALS');
    }

    // Reset failed logins on success
    if (user.failedLoginAttempts > 0) {
      await usersRepository.updateFailedLogins(user.id, 0);
    }
    await usersRepository.updateLastLogin(user.id);

    const payload: AuthTokenPayload = {
      sub: String(user.id),
      userId: user.id,
      roles: user.roles,
      email: user.email,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
    const refreshToken = jwt.sign(
      { sub: String(user.id), type: 'refresh' },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as any
    );

    await usersRepository.writeUserLog({
      userId: user.id,
      action: 'sign-in',
      ip,
      status: 'success',
      remarks: 'Successful sign-in',
      timestamp: new Date(),
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        mustChangePassword: user.mustChangePassword,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  async signOut(refreshToken: string, userId: number, ip?: string): Promise<void> {
    await usersRepository.writeUserLog({
      userId,
      action: 'sign-out',
      ip,
      status: 'success',
      remarks: 'User signed out',
      timestamp: new Date(),
    });
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    ip?: string
  ): Promise<void> {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    // Legacy DB stores plain-text passwords — compare directly, same as signIn
    const valid = oldPassword === user.passwordHash;
    if (!valid) {
      throw new ValidationError('Current password is incorrect.');
    }

    if (newPassword === user.passwordHash) {
      throw new ValidationError('New password cannot be the same as the old password.');
    }

    const { valid: pwValid, errors } = validatePassword(newPassword);
    if (!pwValid) {
      throw new ValidationError(errors[0] || 'Password does not meet requirements.');
    }

    // Store plain text to match legacy DB schema (Pw column)
    await usersRepository.updatePassword(userId, newPassword);

    await usersRepository.writeUserLog({
      userId,
      action: 'password-changed',
      ip,
      status: 'success',
      remarks: 'Password changed by user',
      timestamp: new Date(),
    });
  }

  async initiatePasswordReset(email: string, ip?: string): Promise<void> {
    const user = await usersRepository.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists — log silently
      logger.info({ email }, 'Password reset requested for unknown email');
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await usersRepository.storePasswordResetToken(user.id, token, expiresAt);

    await usersRepository.writeUserLog({
      userId: user.id,
      action: 'password-reset-initiated',
      ip,
      status: 'success',
      remarks: 'Password reset email requested',
      timestamp: new Date(),
    });

    logger.info({ userId: user.id, token }, 'Password reset token generated');
    // In production, send email via nodemailer
  }

  async confirmPasswordReset(
    token: string,
    newPassword: string,
    ip?: string
  ): Promise<void> {
    const user = await usersRepository.findByResetToken(token);
    if (!user) {
      throw new AuthError('Invalid or expired reset token.', 'INVALID_TOKEN');
    }

    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
      throw new ValidationError(errors[0] || 'Password does not meet requirements.');
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usersRepository.updatePassword(user.id, hash);
    await usersRepository.clearResetToken(user.id);

    await usersRepository.writeUserLog({
      userId: user.id,
      action: 'password-reset-confirmed',
      ip,
      status: 'success',
      remarks: 'Password reset completed',
      timestamp: new Date(),
    });
  }

  async lockAccount(adminId: number, targetUserId: number, ip?: string): Promise<void> {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw new NotFoundError('User not found.');

    await usersRepository.lockUser(targetUserId);
    await usersRepository.writeUserLog({
      userId: adminId,
      action: 'account-locked-by-admin',
      ip,
      status: 'success',
      remarks: `Admin locked user ${targetUserId}`,
      timestamp: new Date(),
    });
  }

  async unlockAccount(adminId: number, targetUserId: number, ip?: string): Promise<void> {
    const user = await usersRepository.findById(targetUserId);
    if (!user) throw new NotFoundError('User not found.');

    await usersRepository.unlockUser(targetUserId);
    await usersRepository.writeUserLog({
      userId: adminId,
      action: 'account-unlocked-by-admin',
      ip,
      status: 'success',
      remarks: `Admin unlocked user ${targetUserId}`,
      timestamp: new Date(),
    });
  }

  async sendMfaCode(userId: number, method: string): Promise<void> {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');
    // MFA code generation/sending stub (extend with real OTP library)
    logger.info({ userId, method }, 'MFA code send requested');
  }

  async verifyMfaCode(userId: number, code: string): Promise<void> {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');
    // MFA verification stub
    if (!code || code.length !== 6) {
      throw new AuthError('Invalid multi-factor code.', 'INVALID_CODE');
    }
    logger.info({ userId }, 'MFA code verified (stub)');
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  }
}

export const authService = new AuthService();
