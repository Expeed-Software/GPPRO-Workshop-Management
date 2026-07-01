import bcrypt from 'bcrypt';
import { usersManagementRepository, UserRecord } from '../repositories/users-management.repository';
import { validatePassword } from '../utils/passwordPolicy';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { AuthTokenPayload } from '../types/User';
import logger from '../utils/logger';

const SALT_ROUNDS = 12;

export class UsersService {
  async listUsers(filters: {
    name?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }, caller: AuthTokenPayload) {
    this.requireSupervisorOrAdmin(caller);
    return usersManagementRepository.getUserList(filters);
  }

  async getUserById(id: number, caller: AuthTokenPayload): Promise<UserRecord> {
    // User can view self; supervisors+ can view any
    if (caller.userId !== id && !this.isSupervisorOrAdmin(caller)) {
      throw new ForbiddenError('You can only view your own profile.');
    }
    const user = await usersManagementRepository.getUserById(id);
    if (!user) throw new NotFoundError('User not found.');
    return user;
  }

  async createUser(data: {
    name: string;
    email: string;
    phone?: string;
    roles: string[];
    password: string;
    status?: string;
    expiresAt?: Date;
  }, caller: AuthTokenPayload): Promise<{ id: number }> {
    this.requireAdmin(caller); // BR-11

    const { valid, errors } = validatePassword(data.password);
    if (!valid) throw new ValidationError(errors[0] || 'Password does not meet requirements.'); // BR-03/15

    const existing = await usersManagementRepository.getUserByEmail(data.email);
    if (existing) throw new ConflictError('Email address is already in use.', 'DUPLICATE_EMAIL'); // BR-12

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const username = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    const id = await usersManagementRepository.insertUser({
      username,
      email: data.email,
      name: data.name,
      phone: data.phone,
      passwordHash,
      roles: data.roles || ['Standard User'],
      status: data.status || 'active',
      createdBy: String(caller.userId),
      mustChangePassword: true,
      expiresAt: data.expiresAt,
    });

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'user-created',
      status: 'success',
      remarks: `Created user ${data.email} (ID: ${id})`,
    });

    return { id };
  }

  async updateUser(id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    roles?: string[];
    status?: string;
    expiresAt?: Date;
  }, caller: AuthTokenPayload): Promise<void> {
    const isAdmin = this.isAdmin(caller);
    const isSupervisor = this.isSupervisor(caller);
    const isSelf = caller.userId === id;

    if (!isAdmin && !isSupervisor && !isSelf) {
      throw new ForbiddenError('You do not have permission to edit this user.');
    }

    // Only admin can change roles BR-11
    if (data.roles && !isAdmin) {
      throw new ForbiddenError('Only administrators can change user roles.');
    }

    if (data.email) {
      const existing = await usersManagementRepository.getUserByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('Email address is already in use.', 'DUPLICATE_EMAIL'); // BR-12
      }
    }

    const user = await usersManagementRepository.getUserById(id);
    if (!user) throw new NotFoundError('User not found.');

    await usersManagementRepository.updateUser(id, { ...data, updatedBy: String(caller.userId) });

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'user-updated',
      status: 'success',
      remarks: `Updated user ID: ${id}`,
    }); // BR-14
  }

  async setUserStatus(id: number, status: 'active' | 'inactive' | 'locked', caller: AuthTokenPayload): Promise<void> {
    this.requireSupervisorOrAdmin(caller); // BR-06

    const user = await usersManagementRepository.getUserById(id);
    if (!user) throw new NotFoundError('User not found.');

    await usersManagementRepository.setUserStatus(id, status, String(caller.userId));

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: `user-status-${status}`,
      status: 'success',
      remarks: `Set user ${id} status to ${status}`,
    }); // BR-14, BR-13
  }

  async bulkSetStatus(userIds: number[], status: string, caller: AuthTokenPayload): Promise<void> {
    this.requireAdmin(caller);

    await usersManagementRepository.bulkSetStatus(userIds, status, String(caller.userId));

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: `bulk-user-status-${status}`,
      status: 'success',
      remarks: `Bulk set ${userIds.length} users to ${status}`,
    }); // BR-45, BR-14
  }

  async resetUserPassword(id: number, newPassword: string, caller: AuthTokenPayload): Promise<void> {
    this.requireAdmin(caller); // BR-11

    const { valid, errors } = validatePassword(newPassword);
    if (!valid) throw new ValidationError(errors[0] || 'Password does not meet requirements.'); // BR-03/15

    const user = await usersManagementRepository.getUserById(id);
    if (!user) throw new NotFoundError('User not found.');

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const pool = (await import('../db/connection')).getDbPool;
    const db = await pool();
    const req = db.request();
    const sql = (await import('mssql')).default;
    req.input('id', sql.Int, id);
    req.input('hash', sql.NVarChar, hash);
    await req.query(`UPDATE USERS SET PasswordHash = @hash, MustChangePassword = 1, FailedLogins = 0, UpdatedAt = GETDATE() WHERE ID = @id`);

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'admin-password-reset',
      status: 'success',
      remarks: `Admin reset password for user ${id}`,
    }); // BR-14
  }

  async updateSelfProfile(data: { name?: string; phone?: string }, caller: AuthTokenPayload): Promise<void> {
    await usersManagementRepository.updateUser(caller.userId, {
      name: data.name,
      phone: data.phone,
      updatedBy: String(caller.userId),
    });

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'self-profile-updated',
      status: 'success',
      remarks: 'User updated own profile',
    });
  }

  async assignRoles(userId: number, roles: string[], caller: AuthTokenPayload): Promise<void> {
    this.requireAdmin(caller); // BR-11

    const user = await usersManagementRepository.getUserById(userId);
    if (!user) throw new NotFoundError('User not found.');

    await usersManagementRepository.assignUserRoles(userId, roles, String(caller.userId));

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'user-roles-assigned',
      status: 'success',
      remarks: `Assigned roles [${roles.join(', ')}] to user ${userId}`,
    }); // BR-11, BR-14, BR-20
  }

  async getUserLog(filters: any, caller: AuthTokenPayload) {
    this.requireSupervisorOrAdmin(caller); // BR-07, BR-131
    return usersManagementRepository.getUserLog(filters);
  }

  async getEmployeeList(filters: any, caller: AuthTokenPayload) {
    this.requireSupervisorOrAdmin(caller);
    return usersManagementRepository.getEmployeeList(filters);
  }

  async getEmployeeById(id: number, caller: AuthTokenPayload) {
    this.requireSupervisorOrAdmin(caller);
    return usersManagementRepository.getEmployeeById(id);
  }

  async getRolePermissions(caller: AuthTokenPayload) {
    this.requireAdmin(caller); // BR-11
    return usersManagementRepository.getRolePermissions();
  }

  async assignPermissions(data: any, caller: AuthTokenPayload) {
    this.requireAdmin(caller); // BR-11, BR-37
    // Permissions are RBAC-configured at the role level; log the change
    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'permissions-updated',
      status: 'success',
      remarks: `Updated permissions: ${JSON.stringify(data)}`,
    });
    return { success: true };
  }

  async bulkImportUsers(rows: any[], caller: AuthTokenPayload): Promise<{ importedCount: number; errors: any[] }> {
    this.requireAdmin(caller);
    const errors: any[] = [];
    let importedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const { valid, errors: pwErrors } = validatePassword(row.password || 'TempPass1!');
        if (!valid) { errors.push({ row: i + 1, error: pwErrors[0] }); continue; }

        const existing = await usersManagementRepository.getUserByEmail(row.email);
        if (existing) { errors.push({ row: i + 1, error: 'Duplicate email' }); continue; } // BR-18

        const hash = await bcrypt.hash(row.password || 'ChangeMe@123', SALT_ROUNDS);
        await usersManagementRepository.insertUser({
          username: row.username || row.email.split('@')[0],
          email: row.email,
          name: row.name,
          phone: row.phone,
          passwordHash: hash,
          roles: row.roles ? [row.roles] : ['Standard User'],
          status: 'active',
          createdBy: String(caller.userId),
          mustChangePassword: true,
        });
        importedCount++;
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    await usersManagementRepository.writeAuditLog({
      userId: caller.userId,
      action: 'bulk-user-import',
      status: errors.length ? 'partial' : 'success',
      remarks: `Imported ${importedCount} users, ${errors.length} errors`,
    }); // BR-18, BR-98

    return { importedCount, errors };
  }

  // Helpers
  private requireAdmin(caller: AuthTokenPayload) {
    if (!this.isAdmin(caller)) throw new ForbiddenError('Administrator access required.');
  }

  private requireSupervisorOrAdmin(caller: AuthTokenPayload) {
    if (!this.isSupervisorOrAdmin(caller)) throw new ForbiddenError('Supervisor or Administrator access required.');
  }

  private isAdmin(caller: AuthTokenPayload) {
    return caller.roles?.includes('Administrator');
  }

  private isSupervisor(caller: AuthTokenPayload) {
    return caller.roles?.includes('Supervisor');
  }

  private isSupervisorOrAdmin(caller: AuthTokenPayload) {
    return this.isAdmin(caller) || this.isSupervisor(caller);
  }
}

export const usersService = new UsersService();
